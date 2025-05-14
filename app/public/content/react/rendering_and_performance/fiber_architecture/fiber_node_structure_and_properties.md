# Understanding React Fiber: Node Structure and Properties

React Fiber represents a fundamental reimagining of React's internal architecture. To understand it properly, we need to build our knowledge from the ground up, starting with why it exists and how it works at its core.

> "Fiber is the new reconciliation engine in React 16. Its main goal is to enable incremental rendering of the virtual DOM." — Andrew Clark, React Core Team

## What is React Fiber?

Let's begin with a fundamental question: What exactly is React Fiber?

React Fiber is not a feature that you use directly in your code. Rather, it's the internal implementation of React's core algorithm—a complete rewrite of React's reconciliation process. Reconciliation is the process of determining what changes need to be made to the DOM when a component's state or props change.

### The Problem Fiber Solves

Before diving into Fiber's structure, let's understand the problem it was designed to solve.

In earlier React versions (pre-16), the reconciliation process was synchronous and recursive. When state changed in a component, React would traverse the entire component tree, build a new virtual DOM tree, compare it with the previous one, and commit all changes to the real DOM in a single, uninterruptible process.

This approach had limitations:

> The main problem with the synchronous reconciliation was that if the component tree was large, it could block the main thread for too long, causing performance issues like dropped frames and unresponsive UI.

Fiber was designed to solve this problem by making reconciliation:

1. Incremental - work can be broken into chunks
2. Interruptible - work can be paused and resumed
3. Prioritizable - different types of updates can be assigned priority

## The Fundamentals of Fiber Architecture

At its core, React Fiber is a reimplementation of the reconciliation algorithm based on two key ideas:

1. **Fiber as a data structure** - A representation of a unit of work
2. **Fiber as an execution model** - A way to schedule, pause, and resume work

Let's start with the most basic concept:

### What is a Fiber Node?

A Fiber node is essentially a JavaScript object that represents a component instance, DOM node, or other React element in memory. It's the basic unit of work in React's new reconciliation algorithm.

> Think of a Fiber node as a virtual stack frame—it tracks where a program is in its execution and maintains information about the component it represents.

## Fiber Node Structure

A Fiber node is a plain JavaScript object with approximately 30 properties. Let's examine the most important ones:

```javascript
// Simplified representation of a Fiber node
{
  // Instance
  stateNode: null, // Reference to the component instance or DOM node
  
  // Fiber relationships (forming a tree and linked list)
  return: null,    // Parent fiber
  child: null,     // First child fiber
  sibling: null,   // Next sibling fiber
  
  // Effect 
  effectTag: 0,    // Indicates what work needs to be done (update, placement, deletion)
  nextEffect: null,// Next fiber with effects
  
  // Inputs
  pendingProps: {}, // New props being processed
  memoizedProps: {},// Props used for the current render
  
  // State
  memoizedState: null, // State used for the current render
  updateQueue: null,   // Queue of state updates
  
  // Additional metadata
  elementType: null,   // The function or class that defined this component
  type: null,          // More specific type information
  key: null,           // Key used for reconciliation
  
  // Work information
  lanes: 0,            // Priorities for this fiber
  expirationTime: 0,   // When work on this fiber should complete
  
  // Alternate fiber (used for work-in-progress)
  alternate: null      // Points to the corresponding fiber in the other tree
}
```

Each fiber represents a unit of work and maintains information about a component in the component tree. Let's break down the most critical properties:

### Core Fiber Relationships

The structural properties of a Fiber node create both a tree and a linked list:

```javascript
// Fiber relationships forming a tree and linked list
{
  return: null,  // Parent fiber
  child: null,   // First child fiber
  sibling: null  // Next sibling fiber
}
```

Let's visualize this with a simple component structure:

```javascript
function App() {
  return (
    <div>
      <Header />
      <Content>
        <Article />
        <Sidebar />
      </Content>
      <Footer />
    </div>
  );
}
```

The corresponding Fiber tree would look like:

```
App
 │
 ├─▶ div
     │
     ├─▶ Header ─────▶ null
     │
     ├─▶ Content ────┐
     │               │
     │               ├─▶ Article ───▶ null
     │               │
     │               └─▶ Sidebar ───▶ null
     │
     └─▶ Footer ─────▶ null
```

In this structure:

* `child` points to the first child
* `sibling` points to the next sibling
* `return` points back to the parent

> This structure is crucial because it allows React to traverse the tree efficiently and, more importantly, to pause work and resume it later—something that wasn't possible with the old recursive approach.

### Example: Traversing a Fiber Tree

To understand how React uses this structure, let's look at a simplified traversal algorithm:

```javascript
function traverseFiber(fiber) {
  // Work on this fiber
  console.log(fiber.type);
  
  // Traverse down to child first
  if (fiber.child) {
    return fiber.child;
  }
  
  // If no children, look for siblings or go back up to parent
  let nextFiber = fiber;
  while (nextFiber) {
    // If we have a sibling, traverse it next
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // Otherwise, go back up to parent
    nextFiber = nextFiber.return;
  }
  
  return null; // Done traversing
}

// Start traversal
let nextUnitOfWork = rootFiber;
while (nextUnitOfWork) {
  nextUnitOfWork = traverseFiber(nextUnitOfWork);
  // This loop can be interrupted at any point
  // and resumed later from nextUnitOfWork
}
```

This simplified example shows how React can traverse the tree and, importantly, how it can stop at any point and resume later.

## Important Fiber Node Properties

Let's explore the key properties in more depth:

### Instance-Related Properties

```javascript
{
  stateNode: null, // Reference to component instance or DOM node
  type: null,      // The function or class that defined the component
  key: null        // Key used for reconciliation
}
```

The `stateNode` is particularly important as it points to the actual instance:

* For class components, it references the class instance
* For DOM elements, it references the actual DOM node
* For function components, it's typically null

### Example: Accessing the DOM Node from a Fiber

```javascript
function MyComponent() {
  const ref = React.useRef(null);
  
  React.useEffect(() => {
    // This is where you'd access the actual DOM node
    console.log('DOM node:', ref.current);
  
    // The fiber can be accessed through internal properties
    // (Note: this is not public API)
    const fiber = ref.current._internalFiber;
    console.log('Fiber node:', fiber);
  }, []);
  
  return <div ref={ref}>Hello World</div>;
}
```

> Important: Accessing internal fiber properties directly is not recommended in production code as it's not part of React's public API.

### State and Props Properties

```javascript
{
  pendingProps: {}, // New props being processed
  memoizedProps: {},// Props used for the current render
  memoizedState: null, // State used for the current render
  updateQueue: null    // Queue of state updates
}
```

These properties track the current and pending state/props of a component:

* `pendingProps` contains the props that the component will receive in the next render
* `memoizedProps` contains the props used in the most recent render
* `memoizedState` holds the state used in the most recent render
* `updateQueue` is a linked list of state updates scheduled for the component

### Example: State Updates in Fiber

When you call `setState`, React creates an update object and adds it to the update queue:

```javascript
function enqueueUpdate(fiber, update) {
  // Simplified version of how React queues updates
  const updateQueue = fiber.updateQueue || {
    baseState: fiber.memoizedState,
    firstUpdate: null,
    lastUpdate: null
  };
  
  // Add update to queue
  if (updateQueue.lastUpdate === null) {
    // First update
    updateQueue.firstUpdate = updateQueue.lastUpdate = update;
  } else {
    // Additional update
    updateQueue.lastUpdate.next = update;
    updateQueue.lastUpdate = update;
  }
  
  fiber.updateQueue = updateQueue;
}
```

During processing, React applies these updates in sequence to calculate the new state.

### Work-Related Properties

```javascript
{
  effectTag: 0,     // Indicates what work needs to be done
  nextEffect: null, // Next fiber with effects
  lanes: 0,         // Priorities for this fiber
  alternate: null   // Points to corresponding fiber in other tree
}
```

These properties control how and when the work represented by this fiber is processed:

* `effectTag` indicates what type of work needs to be done (update, placement, deletion)
* `nextEffect` forms a linked list of fibers with effects, optimizing the commit phase
* `lanes` represents priorities (introduced in React 17 to replace expirationTime)
* `alternate` connects the current fiber tree with the work-in-progress tree

> The concept of "two trees" is fundamental to React Fiber. At any time, React maintains two trees: the current tree (representing what's on screen) and the work-in-progress tree (representing the in-progress update).

## Double Buffering in Fiber

React Fiber uses a technique called "double buffering" to build a work-in-progress tree off-screen while the current tree is visible.

```javascript
// Simplified example of how React creates a work-in-progress fiber
function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  
  if (workInProgress === null) {
    // Create a new fiber if alternate doesn't exist
    workInProgress = {
      // Copy properties from current fiber
      tag: current.tag,
      key: current.key,
      elementType: current.elementType,
      type: current.type,
      stateNode: current.stateNode,
    
      // Reset work-specific properties
      return: null,
      child: null,
      sibling: null,
      effectTag: 0,
    
      // Set as alternate
      alternate: current,
    
      // New props
      pendingProps: pendingProps
    
      // ... other properties
    };
  
    current.alternate = workInProgress;
  } else {
    // Reuse the existing alternate
    workInProgress.pendingProps = pendingProps;
    workInProgress.effectTag = 0;
    workInProgress.child = null;
    workInProgress.sibling = null;
  
    // Clear effects
    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;
  }
  
  // Copy over state
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  
  return workInProgress;
}
```

During reconciliation, React builds the work-in-progress tree, and once complete, it switches the pointer from the current tree to the work-in-progress tree, making it the new current tree. This approach allows React to:

1. Work on updates without affecting the UI
2. Discard in-progress work if a higher priority update comes in
3. Reuse memory and avoid allocations by recycling nodes

## Phases of Fiber Reconciliation

Fiber reconciliation happens in two main phases:

1. **Render/Reconciliation Phase** (can be interrupted):
   * Create new fibers
   * Update fiber properties
   * Compute state changes
   * Identify what DOM updates are needed
2. **Commit Phase** (cannot be interrupted):
   * Apply all the effects
   * Update the actual DOM
   * Run lifecycle methods and hooks

### Example: Phases in Action

Let's see a simplified example of how these phases work:

```javascript
// Phase 1: Render/Reconciliation (interruptible)
function performUnitOfWork(fiber) {
  // Create new fibers for children
  const children = fiber.type(fiber.pendingProps);
  reconcileChildren(fiber, children);
  
  // Return next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.return;
  }
  
  return null;
}

// Called after all work is complete
function commitWork(fiber) {
  if (!fiber) return;
  
  const parentFiber = fiber.return;
  const parentNode = parentFiber.stateNode;
  
  if (fiber.effectTag === 'PLACEMENT' && fiber.stateNode != null) {
    // Add node to DOM
    parentNode.appendChild(fiber.stateNode);
  } else if (fiber.effectTag === 'UPDATE' && fiber.stateNode != null) {
    // Update existing node
    updateDOMProperties(fiber.stateNode, fiber.alternate.memoizedProps, fiber.memoizedProps);
  } else if (fiber.effectTag === 'DELETION') {
    // Remove node from DOM
    parentNode.removeChild(fiber.stateNode);
  }
  
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

The key difference between the phases is that the render phase can be interrupted, allowing React to:

1. Pause work to handle higher priority updates
2. Abandon work in progress if it's no longer needed
3. Split work into chunks to avoid blocking the main thread

> The ability to pause, resume, and prioritize work is what makes React Fiber so powerful for performance optimization, especially in complex applications.

## Priorities and Scheduling in Fiber

React Fiber introduces the concept of priorities for different types of updates:

```javascript
// Simplified priority levels (based on React 17+)
const SyncLane = 0b0000000000000000000000000000001;
const InputContinuousLane = 0b0000000000000000000000000000010;
const DefaultLane = 0b0000000000000000000000000000100;
const IdleLane = 0b0100000000000000000000000000000;

// Function to schedule work with a priority
function scheduleUpdateOnFiber(fiber, lane) {
  // Mark fiber and ancestors with this lane
  markUpdateLaneFromFiberToRoot(fiber, lane);
  
  if (lane === SyncLane) {
    // Synchronous update - do work immediately
    performSyncWorkOnRoot(root);
  } else {
    // Schedule async work
    scheduleCallback(lane, () => {
      performConcurrentWorkOnRoot(root);
    });
  }
}
```

Different types of updates get different priorities:

* **Urgent updates** (direct user input) - highest priority
* **Transition updates** (UI transitions, data loading) - medium priority
* **Background updates** (offscreen work) - lowest priority

React can work on higher priority updates first, pause lower priority work, and even throw away in-progress low-priority work if a higher priority update comes in.

## Example: Fiber in a Complete Component

Let's see how Fiber works in a complete component example:

```javascript
class Counter extends React.Component {
  state = { count: 0 };
  
  handleClick = () => {
    this.setState(state => ({ count: state.count + 1 }));
  };
  
  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleClick}>Increment</button>
      </div>
    );
  }
}
```

When the button is clicked:

1. A click event triggers `handleClick`
2. `setState` is called, creating an update object
3. The update is added to the fiber's update queue
4. React schedules work to process this update
5. During the render phase, React traverses the fiber tree starting from the Counter component
6. It computes the new state and determines what changed
7. It builds or updates the work-in-progress tree with these changes
8. During the commit phase, React applies the changes to the DOM
9. The component re-renders with the new count

All of this is managed by the Fiber architecture, allowing React to prioritize, pause, and resume work as needed.

## The Structure of Current and Work-in-Progress Trees

As mentioned earlier, React maintains two trees at all times:

1. **Current Tree** : Represents what's currently rendered on screen
2. **Work-in-Progress Tree** : Represents the tree being built for the next render

```
     Current Tree              Work-in-Progress Tree
     ------------              ---------------------
        App                         App
         │                           │
         ▼                           ▼
        div                         div
         │                           │
         ├─▶ Header                  ├─▶ Header
         │                           │
         ├─▶ Content                 ├─▶ Content (with updates)
         │    │                      │    │
         │    ├─▶ Article            │    ├─▶ Article (with updates)
         │    │                      │    │
         │    └─▶ Sidebar            │    └─▶ Sidebar
         │                           │
         └─▶ Footer                  └─▶ Footer
                                   
                 ↓                        ↑
        alternate pointers connect the trees
```

The Fiber nodes in each tree are connected via the `alternate` property.

> This dual-tree approach allows React to prepare all updates "off-screen" without affecting the current UI, and then switch to the new tree in a single operation once all work is complete.

## Summary and Practical Implications

React Fiber's node structure and properties form the foundation of React's ability to:

1. **Break work into chunks** - Each fiber represents a unit of work
2. **Prioritize updates** - Through lanes and scheduling
3. **Pause and resume work** - By maintaining traversal state in the fiber structure
4. **Reuse work** - Through double buffering and the alternate structure
5. **Track side effects** - Via effect tags and effect lists

> Understanding Fiber helps developers build more performant React applications by working with React's architecture, not against it.

For practical development, this means:

1. Long, blocking tasks should be broken up or moved off the main thread
2. State updates should be batched when possible
3. Expensive calculations should be memoized
4. The new concurrent features in React (like Suspense) leverage Fiber's capabilities

While most developers don't need to interact with Fiber directly, understanding its principles helps explain React's behavior and performance characteristics.

Would you like me to explore any particular aspect of React Fiber in more depth?
