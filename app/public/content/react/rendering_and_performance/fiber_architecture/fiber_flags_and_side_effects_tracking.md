# Understanding React Fiber Flags and Side Effects Tracking

Let's dive into the internal workings of React Fiber, focusing on how it manages updates and side effects using its flags system. I'll build this explanation from first principles, showing how React's core reconciliation process works.

## The Foundation: Why React Fiber Exists

> React Fiber is a complete reimagination of React's internal reconciliation algorithm, designed to enable incremental rendering and better prioritization of updates.

Before we discuss flags, we need to understand why Fiber was created in the first place.

### React's Reconciliation Challenge

In early versions of React (pre-16), rendering was synchronous and blocking. When React needed to update the UI, it would:

1. Calculate what changed (diffing)
2. Apply all those changes to the DOM in one go
3. Only then return control to the browser

This approach had a significant problem: for complex UI updates, it could block the main thread for too long, causing dropped frames, jank, and an unresponsive user experience.

Consider this example of the problem:

```javascript
// React 15 and earlier: Imagine a complex component
function ComplexList({ items }) {
  // When items changes, React must recalculate everything
  // and apply all changes in one go, blocking the main thread
  return (
    <div>
      {items.map(item => <ComplexItem key={item.id} data={item} />)}
    </div>
  );
}
```

If `items` contained 1000 entries and each `ComplexItem` was computationally expensive to render, the browser could freeze while React worked.

## Introducing React Fiber

> Fiber reimagines rendering as incremental work that can be paused, resumed, and prioritized.

Fiber introduced a new reconciliation algorithm built around these key principles:

1. **Work can be split into units**
2. **Work can be paused and resumed**
3. **Work can be prioritized**
4. **Work can be reused or discarded**

The core of this system is the Fiber node - a JavaScript object that represents a unit of work.

```javascript
// Simplified visualization of a Fiber node structure
const fiber = {
  // Instance
  type: 'div',  // The React element type
  key: 'uniqueKey',
  props: { children: [], className: 'container' },
  
  // Fiber structure
  return: parentFiber,
  child: firstChildFiber,
  sibling: nextSiblingFiber,
  
  // Internal state for work processing
  alternate: workInProgressFiber,
  flags: 0,  // <-- These flags are our focus
  
  // References to the DOM
  stateNode: actualDOMNode,
  
  // More properties...
};
```

Each element in your React tree has a corresponding Fiber node, forming a linked list structure that React can traverse efficiently.

## Understanding Fiber Flags

> Flags are bitfield markers on Fiber nodes that tell React what kind of work needs to be done to that node during the commit phase.

### What Are Flags?

Flags in React Fiber are numeric constants used in a bitfield. A bitfield is a programming technique that uses individual bits of a number to represent different boolean states. This is memory-efficient and allows for fast operations.

For example, if we have these flags defined:

```javascript
// These are actual examples of how React defines flags internally
const Placement = 0b0000000000000010;  // 2 in decimal
const Update = 0b0000000000000100;     // 4 in decimal
const Deletion = 0b0000000000001000;   // 8 in decimal
```

Then React can combine them using bitwise OR operations:

```javascript
// A node that needs to be both placed and updated
const flags = Placement | Update;  // 0b0000000000000110 (6 in decimal)

// Later, React can check if a flag is set:
if (fiber.flags & Placement) {
  // Do placement work
}
if (fiber.flags & Update) {
  // Do update work
}
```

### Common Fiber Flags

React uses many flags to track different kinds of work. Here are some of the most important ones:

1. **Placement** : The node needs to be inserted into the DOM
2. **Update** : The node's props need to be updated
3. **Deletion** : The node needs to be removed from the DOM
4. **ChildDeletion** : A child of this node needs deletion
5. **ContentReset** : Text content needs to be reset
6. **Callback** : A lifecycle method or effect callback needs to be called
7. **Ref** : A ref needs to be attached or detached
8. **Snapshot** : getSnapshotBeforeUpdate needs to be called
9. **Passive** : A passive effect (useEffect) needs to be scheduled
10. **Layout** : A layout effect (useLayoutEffect) needs to be scheduled
11. **Hydrating** : The node is being hydrated from server-rendered HTML

### Example: Tracking Updates with Flags

Let's see a practical example of how React might use flags during an update:

```javascript
// Initial render of a component
function Counter({ count }) {
  return <div>{count}</div>;
}

// When count changes from 0 to 1
```

Behind the scenes, React creates a work-in-progress Fiber tree and marks nodes that need work:

1. When React detects that `count` changed from 0 to 1:
   * It creates a new work-in-progress Fiber node
   * It adds the `Update` flag to this node: `fiber.flags |= Update`
2. During the commit phase, React processes this flag:
   * Checks `if (fiber.flags & Update)` which is true
   * Updates the text content of the div to "1"
   * Clears the flag after handling it

## Side Effects in React

> Side effects are operations that reach outside the React component tree, such as DOM mutations, data fetching, subscriptions, or timers.

React components can have side effects like:

* DOM manipulations
* Setting up event listeners
* API calls
* Setting timers
* Managing subscriptions

Fiber needs to track these side effects to ensure they're executed at the right time and in the right order.

### Side Effects as Flags

React uses specific flags to mark different types of side effects:

```javascript
// Simplified example of effect-related flags
const PassiveEffect = 0b0001000000000000;  // For useEffect
const LayoutEffect = 0b0000010000000000;   // For useLayoutEffect
const RefEffect = 0b0000100000000000;      // For ref updates
```

When you use hooks like `useEffect` or `useLayoutEffect`, React adds the corresponding flag to the Fiber node.

### Example: Using useEffect and Flags

```javascript
function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  
    return () => clearInterval(interval);
  }, []);
  
  return <div>Seconds: {seconds}</div>;
}
```

Behind the scenes, React:

1. Creates a Fiber node for the `Timer` component
2. When it encounters `useEffect`, adds the `PassiveEffect` flag to the Fiber
3. After rendering is complete, checks for this flag
4. If found, adds this effect to a list of effects to be executed

## The Effects List

React doesn't just mark nodes with effect flags; it also builds a linear linked list of all effects that need to be processed. This is called the "effects list."

> The effects list is a subset of the Fiber tree, containing only nodes with effects that need processing.

The effects list is constructed during the "complete" phase of work and is traversed during the "commit" phase.

```javascript
// Pseudocode for how React builds the effects list
function completeWork(current, workInProgress) {
  // Do the work to complete this Fiber...
  
  // If this node has side effects, add it to the effects list
  if (workInProgress.flags !== NoFlags) {
    // Add to parent's effect list
    if (returnFiber.firstEffect === null) {
      returnFiber.firstEffect = workInProgress.firstEffect;
    }
  
    // Add this Fiber to the end of the effect list
    if (returnFiber.lastEffect !== null) {
      returnFiber.lastEffect.nextEffect = workInProgress;
    }
    returnFiber.lastEffect = workInProgress;
  }
}
```

Here's a visualization of how the effects list might look:

```
Root Fiber → EffectNode1 → EffectNode2 → EffectNode3 → null
               (Update)     (Placement)     (Ref)
```

### Processing the Effects List

During the commit phase, React processes this list in multiple passes, with each pass handling different kinds of effects in a specific order:

1. **First pass** : Handle all `Snapshot` effects
2. **Second pass** : Handle all DOM mutations (Placement, Update, Deletion)
3. **Third pass** : Handle `Ref` effects
4. **Fourth pass** : Handle `Layout` effects (useLayoutEffect callbacks)
5. **Asynchronously later** : Handle `Passive` effects (useEffect callbacks)

This order ensures that effects are executed consistently and predictably.

## Concrete Example: Component Lifecycle with Flags

Let's walk through a complete example to see flags and effects in action:

```javascript
function ProfileCard({ user }) {
  const cardRef = useRef(null);
  
  // This will add a PassiveEffect flag
  useEffect(() => {
    console.log("Profile card mounted, user:", user.name);
    return () => console.log("Profile card unmounted");
  }, [user.name]);
  
  // This will add a LayoutEffect flag
  useLayoutEffect(() => {
    if (cardRef.current) {
      // Measure the card height
      const height = cardRef.current.getBoundingClientRect().height;
      console.log("Card height:", height);
    }
  }, []);
  
  return (
    <div ref={cardRef} className="profile-card">
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  );
}
```

When this component mounts:

1. React creates a Fiber node for `ProfileCard`
2. During rendering, it encounters:
   * `useRef`, which sets up a ref without flags at this point
   * `useEffect`, which adds `PassiveEffect` flag
   * `useLayoutEffect`, which adds `LayoutEffect` flag
   * The JSX, which creates child Fiber nodes
3. After rendering the children, React adds `Ref` flag (for the `cardRef`)
4. The Fiber node now has: `fiber.flags = PassiveEffect | LayoutEffect | Ref`
5. React includes this node in the effects list
6. During commit, React:
   * Updates the DOM
   * Processes the `Ref` effect (attaches the ref to the div)
   * Runs the `LayoutEffect` synchronously (measuring height)
   * Schedules the `PassiveEffect` to run asynchronously after paint (logging)

## Practical Implications for Developers

While Fiber flags are an internal implementation detail, understanding them provides insights that help you write better React code:

> Understanding the order of operations helps explain why useLayoutEffect runs before useEffect, and why DOM updates happen before refs are attached.

### Performance Considerations

1. **Minimizing DOM Updates** : Each DOM change adds flags that React must process. Batch your state updates when possible.
2. **Effects Scheduling** : Use the appropriate effect hook:

* `useLayoutEffect` for DOM measurements and synchronous updates
* `useEffect` for everything else

1. **Component Stability** : Stable component identities (with proper keys) reduce unnecessary `Placement` and `Deletion` flags.

### Common Patterns and Their Flag Implications

1. **Conditional Rendering** :

```javascript
function ConditionalComponent({ showDetails }) {
  return (
    <div>
      <h1>Header</h1>
      {showDetails && <Details />}
    </div>
  );
}
```

When `showDetails` changes:

* `true→false`: React sets `Deletion` flags
* `false→true`: React sets `Placement` flags

2. **List Rendering** :

```javascript
function ListComponent({ items }) {
  return (
    <ul>
      {items.map(item => <li key={item.id}>{item.text}</li>)}
    </ul>
  );
}
```

When `items` changes:

* With proper `key` props: React minimizes flags, setting `Update` for changed items
* Without proper keys: React uses more `Placement` and `Deletion` flags

## The Mental Model: Fiber as a Work Tracking System

> Think of Fiber flags as post-it notes that React attaches to elements, saying "do this to me during commit."

This mental model helps understand the phases:

1. **Render Phase** : React walks through your component tree, calls your components, and builds a Fiber tree with flags marking what needs to be done
2. **Commit Phase** : React processes the effects list, handling each flag in order:

* DOM mutations
* Refs
* Layout effects
* Passive effects

## Conclusion

React Fiber's flag system is a powerful mechanism for tracking and executing side effects in a predictable way. The flags allow React to:

1. Know exactly what work needs to be done
2. Break the work into prioritizable units
3. Execute side effects in a consistent order
4. Maintain a clear separation between the rendering and commit phases

Understanding this system gives you deeper insight into how React works and helps you make better architectural decisions in your applications.

While you don't need to interact with flags directly, knowing about them helps explain React's behavior and performance characteristics—especially when debugging complex update patterns or optimizing render performance.
