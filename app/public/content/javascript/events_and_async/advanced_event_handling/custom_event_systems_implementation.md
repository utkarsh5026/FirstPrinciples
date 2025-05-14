# Custom Event Systems in the Browser: From First Principles

Let's build a comprehensive understanding of custom event systems in the browser, starting from the absolute fundamentals and gradually building up to more complex implementations.

## 1. What is an Event?

At its core, an event is a signal that something has happened. In browsers, events are fundamental to creating interactive web pages. They represent occurrences like:

* A user clicking on an element
* A page finishing loading
* A form being submitted
* An element receiving focus

These built-in events are provided by the browser, but sometimes we need custom events for application-specific interactions that aren't covered by the standard events.

## 2. The Observer Pattern - The Foundation of Events

Before diving into browser-specific implementations, let's understand the design pattern that underpins event systems: the Observer pattern.

The Observer pattern involves:

1. An **observable** (or subject) - The object that emits events
2. **Observers** (or listeners) - Objects that want to be notified when events occur

For example, imagine a simple thermostat system:

```javascript
class Thermostat {
  constructor() {
    this.temperature = 20;
    this.observers = [];
  }
  
  // Method to add observers
  addObserver(observer) {
    this.observers.push(observer);
  }
  
  // Method to notify all observers
  notifyObservers() {
    for (const observer of this.observers) {
      observer.update(this.temperature);
    }
  }
  
  // Method to change temperature
  setTemperature(temp) {
    this.temperature = temp;
    this.notifyObservers();
  }
}

// An observer
class TemperatureDisplay {
  update(temperature) {
    console.log(`Temperature updated to: ${temperature}°C`);
  }
}

// Usage
const thermostat = new Thermostat();
const display = new TemperatureDisplay();

thermostat.addObserver(display);
thermostat.setTemperature(22); // Will log: "Temperature updated to: 22°C"
```

In this example, the `Thermostat` is the observable, and the `TemperatureDisplay` is an observer. When the temperature changes, all observers are notified.

## 3. Native Browser Event System

The browser already has a built-in event system that follows a similar pattern:

```javascript
// Adding an event listener (registering an observer)
document.getElementById('myButton').addEventListener('click', function(event) {
  console.log('Button was clicked!', event);
});
```

Here:

* The DOM element (`myButton`) is the observable
* The callback function is the observer
* 'click' is the type of event we're interested in

Let's understand what happens when we click the button:

1. The browser detects a mouse click on the button element
2. It creates an `Event` object with information about the click
3. It calls all registered click event listeners on that element, passing the event object

## 4. The Event Interface

Before we implement our own event system, let's understand the native `Event` interface:

```javascript
// Creating a basic Event
const simpleEvent = new Event('simple');

// Creating a more detailed event with CustomEvent
const detailedEvent = new CustomEvent('detailed', {
  detail: { message: 'This is a custom event with data' },
  bubbles: true,
  cancelable: true
});

// Properties of events
console.log(detailedEvent.type); // "detailed"
console.log(detailedEvent.detail.message); // "This is a custom event with data"
console.log(detailedEvent.bubbles); // true
console.log(detailedEvent.cancelable); // true
```

The `Event` interface provides properties like:

* `type`: The name/type of the event
* `target`: The element that triggered the event
* `currentTarget`: The element that the event handler is attached to
* `bubbles`: Whether the event bubbles up through the DOM
* `cancelable`: Whether the event can be canceled
* `timeStamp`: When the event was created

The `CustomEvent` interface extends this with the `detail` property for passing custom data.

## 5. Building a Simple Custom Event System

Now let's implement our own event system for a hypothetical UI component:

```javascript
class UIComponent {
  constructor() {
    // Store event listeners in a map where:
    // - keys are event types
    // - values are arrays of listener functions
    this.eventListeners = new Map();
  }
  
  // Add a listener for a specific event type
  addEventListener(eventType, listener) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
  
    this.eventListeners.get(eventType).push(listener);
  }
  
  // Remove a specific listener
  removeEventListener(eventType, listener) {
    if (!this.eventListeners.has(eventType)) return;
  
    const listeners = this.eventListeners.get(eventType);
    const index = listeners.indexOf(listener);
  
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  
  // Dispatch an event, notifying all listeners
  dispatchEvent(eventType, eventData = {}) {
    if (!this.eventListeners.has(eventType)) return;
  
    const event = {
      type: eventType,
      target: this,
      data: eventData,
      timestamp: Date.now()
    };
  
    for (const listener of this.eventListeners.get(eventType)) {
      listener(event);
    }
  }
}

// Usage example
const dropdown = new UIComponent();

// Register a listener
const onDropdownOpen = (event) => {
  console.log(`Dropdown opened at ${new Date(event.timestamp)}`);
  console.log('Extra data:', event.data);
};

dropdown.addEventListener('open', onDropdownOpen);

// Later, trigger the event
dropdown.dispatchEvent('open', { reason: 'user clicked' });
// Logs:
// "Dropdown opened at Thu May 01 2025 12:34:56"
// "Extra data: { reason: 'user clicked' }"

// Remove the listener when done
dropdown.removeEventListener('open', onDropdownOpen);
```

This simple system captures the essence of event handling:

1. We maintain a collection of listeners for different event types
2. We provide methods to add and remove listeners
3. We have a method to dispatch events with custom data
4. Listeners receive an event object with useful information

## 6. Using the DOM's Built-in Event System for Custom Events

The browser already provides powerful event handling capabilities. We can leverage this with custom events:

```javascript
class EnhancedDropdown {
  constructor(element) {
    this.element = element;
    this.isOpen = false;
  
    // Set up initial UI and handlers
    this.setupUI();
  }
  
  setupUI() {
    this.element.addEventListener('click', () => this.toggle());
  }
  
  open() {
    if (this.isOpen) return;
  
    // First check if opening should be prevented
    const willOpenEvent = new CustomEvent('willOpen', {
      bubbles: true,
      cancelable: true, // This event can be canceled
      detail: { dropdown: this }
    });
  
    // Dispatch the event and check if it was canceled
    const canOpen = this.element.dispatchEvent(willOpenEvent);
  
    if (!canOpen) {
      console.log('Opening was prevented by an event listener');
      return;
    }
  
    // Perform the actual opening
    this.isOpen = true;
    this.element.classList.add('open');
  
    // Notify that opening has occurred
    const didOpenEvent = new CustomEvent('didOpen', {
      bubbles: true,
      detail: { dropdown: this }
    });
  
    this.element.dispatchEvent(didOpenEvent);
  }
  
  close() {
    if (!this.isOpen) return;
  
    // Similar pattern for closing...
    const willCloseEvent = new CustomEvent('willClose', {
      bubbles: true,
      cancelable: true,
      detail: { dropdown: this }
    });
  
    const canClose = this.element.dispatchEvent(willCloseEvent);
    if (!canClose) return;
  
    this.isOpen = false;
    this.element.classList.remove('open');
  
    const didCloseEvent = new CustomEvent('didClose', {
      bubbles: true,
      detail: { dropdown: this }
    });
  
    this.element.dispatchEvent(didCloseEvent);
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}

// Usage
const dropdownElement = document.getElementById('myDropdown');
const dropdown = new EnhancedDropdown(dropdownElement);

// Listen for custom events
dropdownElement.addEventListener('willOpen', (event) => {
  console.log('Dropdown is about to open', event.detail.dropdown);
  
  // Prevent opening if certain condition is met
  if (someCondition) {
    event.preventDefault();
  }
});

dropdownElement.addEventListener('didOpen', (event) => {
  console.log('Dropdown has opened');
});
```

This approach:

1. Uses the browser's native event system instead of reinventing it
2. Follows common patterns like "will/did" for events before and after actions
3. Demonstrates event cancellation with `preventDefault()`
4. Shows how to pass custom data via the `detail` property

## 7. Event Bubbling and Capturing

A powerful feature of the DOM event system is event propagation through bubbling and capturing:

```javascript
// HTML structure:
// <div id="outer">
//   <div id="middle">
//     <button id="inner">Click me</button>
//   </div>
// </div>

const outer = document.getElementById('outer');
const middle = document.getElementById('middle');
const inner = document.getElementById('inner');

// Capturing phase (top-down)
outer.addEventListener('click', e => {
  console.log('Outer - Capture phase');
}, true); // true enables capture phase

middle.addEventListener('click', e => {
  console.log('Middle - Capture phase');
}, true);

inner.addEventListener('click', e => {
  console.log('Inner - Capture phase');
}, true);

// Bubbling phase (bottom-up)
outer.addEventListener('click', e => {
  console.log('Outer - Bubble phase');
});

middle.addEventListener('click', e => {
  console.log('Middle - Bubble phase');
});

inner.addEventListener('click', e => {
  console.log('Inner - Bubble phase');
});

// When clicking the button, logs will appear in this order:
// 1. "Outer - Capture phase"
// 2. "Middle - Capture phase"
// 3. "Inner - Capture phase"
// 4. "Inner - Bubble phase"
// 5. "Middle - Bubble phase"
// 6. "Outer - Bubble phase"
```

This demonstrates how events move through the DOM in two phases:

1. **Capturing phase** : From the window down to the target element
2. **Bubbling phase** : From the target element back up to the window

We can implement similar behavior in our custom event system:

```javascript
class Component {
  constructor(name) {
    this.name = name;
    this.children = [];
    this.parent = null;
    this.eventListeners = {
      capture: new Map(),
      bubble: new Map()
    };
  }
  
  addChild(child) {
    this.children.push(child);
    child.parent = this;
    return child;
  }
  
  addEventListener(eventType, listener, useCapture = false) {
    const phase = useCapture ? 'capture' : 'bubble';
    if (!this.eventListeners[phase].has(eventType)) {
      this.eventListeners[phase].set(eventType, []);
    }
    this.eventListeners[phase].get(eventType).push(listener);
  }
  
  dispatchEvent(event) {
    event.currentTarget = this;
  
    // If this is the initial dispatch, set the target
    if (!event.target) {
      event.target = this;
    
      // Build path for event propagation
      event._path = [];
      let current = this;
      while (current) {
        event._path.unshift(current); // Add to front for capture phase
        current = current.parent;
      }
    }
  
    // Handle both phases
    if (event._propagationPhase === undefined) {
      // Start with capturing phase
      event._propagationPhase = 'capture';
      event._currentPathIndex = 0;
    
      // Process the whole path
      this._propagateEvent(event);
    } else {
      // Continue propagation from the current component
      this._propagateEventFromCurrent(event);
    }
  }
  
  _propagateEvent(event) {
    // Process all components in the path
    while (event._currentPathIndex < event._path.length) {
      const current = event._path[event._currentPathIndex];
    
      if (event._propagationPhase === 'capture') {
        current._processEventListeners(event, 'capture');
        event._currentPathIndex++;
      
        // When reaching the target, switch to bubbling
        if (event._currentPathIndex === event._path.length) {
          event._propagationPhase = 'bubble';
          event._currentPathIndex--;
        }
      } else { // Bubbling phase
        current._processEventListeners(event, 'bubble');
        event._currentPathIndex--;
      
        // End when we've bubbled back to the top
        if (event._currentPathIndex < 0) {
          break;
        }
      }
    
      // Stop propagation if requested
      if (event._stopPropagation) {
        break;
      }
    }
  }
  
  _propagateEventFromCurrent(event) {
    // Continue from where we left off
    const current = event._path[event._currentPathIndex];
    current._processEventListeners(event, event._propagationPhase);
  
    // Move to next component
    if (event._propagationPhase === 'capture') {
      event._currentPathIndex++;
      if (event._currentPathIndex === event._path.length) {
        event._propagationPhase = 'bubble';
        event._currentPathIndex--;
      }
    } else { // Bubbling
      event._currentPathIndex--;
    }
  
    // Continue propagation if not stopped
    if (!event._stopPropagation && 
        (event._currentPathIndex >= 0 && 
         event._currentPathIndex < event._path.length)) {
      event._path[event._currentPathIndex].dispatchEvent(event);
    }
  }
  
  _processEventListeners(event, phase) {
    const listeners = this.eventListeners[phase].get(event.type) || [];
  
    for (const listener of listeners) {
      // Update currentTarget to the current component
      event.currentTarget = this;
      listener(event);
    
      // Check if immediate propagation was stopped
      if (event._stopImmediatePropagation) {
        break;
      }
    }
  }
}

// Creating a custom event
function createEvent(type, options = {}) {
  return {
    type,
    target: null,
    currentTarget: null,
    stopPropagation() {
      this._stopPropagation = true;
    },
    stopImmediatePropagation() {
      this._stopImmediatePropagation = true;
      this._stopPropagation = true;
    },
    preventDefault() {
      if (this.cancelable) {
        this._defaultPrevented = true;
      }
    },
    _defaultPrevented: false,
    cancelable: options.cancelable !== false,
    bubbles: options.bubbles !== false,
    ...options
  };
}

// Usage example
const parent = new Component('parent');
const child = parent.addChild(new Component('child'));
const grandchild = child.addChild(new Component('grandchild'));

// Add event listeners
parent.addEventListener('custom', e => {
  console.log('Parent - Capture phase');
}, true);

child.addEventListener('custom', e => {
  console.log('Child - Capture phase');
}, true);

grandchild.addEventListener('custom', e => {
  console.log('Grandchild - Capture phase');
}, true);

parent.addEventListener('custom', e => {
  console.log('Parent - Bubble phase');
});

child.addEventListener('custom', e => {
  console.log('Child - Bubble phase');
});

grandchild.addEventListener('custom', e => {
  console.log('Grandchild - Bubble phase');
  // Uncomment to stop propagation
  // e.stopPropagation();
});

// Dispatch event from grandchild
const event = createEvent('custom', { detail: { message: 'Hello' } });
grandchild.dispatchEvent(event);
```

This advanced implementation demonstrates:

1. Event propagation through a component hierarchy
2. Both capturing and bubbling phases
3. The ability to stop propagation
4. Event targeting and current target concepts

## 8. Event Delegation

Event delegation is a technique where we attach a single event listener to a parent element instead of many listeners on child elements:

```javascript
// Without event delegation
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', e => {
    console.log(`Clicked on ${item.textContent}`);
  });
});

// With event delegation
document.querySelector('.menu').addEventListener('click', e => {
  if (e.target.matches('.menu-item')) {
    console.log(`Clicked on ${e.target.textContent}`);
  }
});
```

Event delegation has several advantages:

1. Better performance (fewer event listeners)
2. Works for dynamically added elements
3. Requires less memory
4. Centralized event handling logic

Let's implement a custom component with event delegation for a to-do list:

```javascript
class TodoList {
  constructor(containerElement) {
    this.container = containerElement;
    this.todos = [];
  
    // Set up a single delegated event handler
    this.container.addEventListener('click', this.handleClick.bind(this));
  
    // Create custom events
    this.events = {
      itemAdded: new CustomEvent('itemAdded', { bubbles: true }),
      itemRemoved: new CustomEvent('itemRemoved', { bubbles: true }),
      itemCompleted: new CustomEvent('itemCompleted', { bubbles: true })
    };
  }
  
  // Delegated event handler
  handleClick(event) {
    const target = event.target;
  
    // Handle different actions based on clicked elements
    if (target.matches('.todo-checkbox')) {
      const todoId = parseInt(target.closest('.todo-item').dataset.id);
      this.toggleComplete(todoId);
    } 
    else if (target.matches('.todo-delete')) {
      const todoId = parseInt(target.closest('.todo-item').dataset.id);
      this.removeTodo(todoId);
    }
  }
  
  addTodo(text) {
    const todo = {
      id: Date.now(),
      text,
      completed: false
    };
  
    this.todos.push(todo);
    this.render();
  
    // Dispatch custom event with the new todo
    const addEvent = new CustomEvent('itemAdded', {
      bubbles: true,
      detail: { todo }
    });
    this.container.dispatchEvent(addEvent);
  
    return todo;
  }
  
  toggleComplete(todoId) {
    const todo = this.todos.find(todo => todo.id === todoId);
    if (todo) {
      todo.completed = !todo.completed;
      this.render();
    
      // Dispatch custom event
      const completeEvent = new CustomEvent('itemCompleted', {
        bubbles: true,
        detail: { todo }
      });
      this.container.dispatchEvent(completeEvent);
    }
  }
  
  removeTodo(todoId) {
    const todoIndex = this.todos.findIndex(todo => todo.id === todoId);
    if (todoIndex !== -1) {
      const removedTodo = this.todos.splice(todoIndex, 1)[0];
      this.render();
    
      // Dispatch custom event
      const removeEvent = new CustomEvent('itemRemoved', {
        bubbles: true,
        detail: { todo: removedTodo }
      });
      this.container.dispatchEvent(removeEvent);
    }
  }
  
  render() {
    this.container.innerHTML = `
      <ul class="todo-list">
        ${this.todos.map(todo => `
          <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${todo.text}</span>
            <button class="todo-delete">Delete</button>
          </li>
        `).join('')}
      </ul>
      <div class="todo-stats">
        ${this.todos.length} items, ${this.todos.filter(t => t.completed).length} completed
      </div>
    `;
  }
}

// Usage
const container = document.getElementById('todo-container');
const todoList = new TodoList(container);

// Add todos
todoList.addTodo('Learn about custom events');
todoList.addTodo('Implement event delegation');

// Listen for custom events
container.addEventListener('itemAdded', event => {
  console.log('Todo added:', event.detail.todo);
});

container.addEventListener('itemCompleted', event => {
  const todo = event.detail.todo;
  console.log(`Todo "${todo.text}" marked as ${todo.completed ? 'completed' : 'incomplete'}`);
});

container.addEventListener('itemRemoved', event => {
  console.log('Todo removed:', event.detail.todo);
});
```

This example shows:

1. Event delegation for efficient event handling
2. Custom events for application-specific notifications
3. How to pass relevant data with events
4. Separation of concerns between UI interactions and data changes

## 9. Event Bus/Pub-Sub Pattern

For more complex applications, we often need events to flow between components that aren't in a parent-child relationship. The Event Bus (or Pub-Sub) pattern provides a solution:

```javascript
class EventBus {
  constructor() {
    this.subscribers = {};
  }
  
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
  
    const index = this.subscribers[event].push(callback) - 1;
  
    // Return unsubscribe function
    return () => {
      this.subscribers[event].splice(index, 1);
    };
  }
  
  publish(event, data) {
    if (!this.subscribers[event]) {
      return;
    }
  
    this.subscribers[event].forEach(callback => {
      callback(data);
    });
  }
}

// Application example
class ShoppingCart {
  constructor(eventBus) {
    this.items = [];
    this.eventBus = eventBus;
  }
  
  addItem(item) {
    this.items.push(item);
    this.eventBus.publish('cart:item-added', item);
    this.eventBus.publish('cart:updated', this.items);
  }
  
  removeItem(itemId) {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      const removedItem = this.items.splice(index, 1)[0];
      this.eventBus.publish('cart:item-removed', removedItem);
      this.eventBus.publish('cart:updated', this.items);
    }
  }
}

class CartUI {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.cartElement = document.getElementById('shopping-cart');
  
    // Subscribe to events
    this.eventBus.subscribe('cart:updated', this.render.bind(this));
  
    // Delegate UI events
    this.cartElement.addEventListener('click', this.handleClick.bind(this));
  }
  
  handleClick(event) {
    if (event.target.matches('.remove-item')) {
      const itemId = parseInt(event.target.dataset.id);
      this.eventBus.publish('ui:remove-item-clicked', itemId);
    }
  }
  
  render(items) {
    this.cartElement.innerHTML = `
      <h2>Shopping Cart (${items.length} items)</h2>
      <ul>
        ${items.map(item => `
          <li>
            ${item.name} - $${item.price.toFixed(2)}
            <button class="remove-item" data-id="${item.id}">Remove</button>
          </li>
        `).join('')}
      </ul>
      <div class="total">
        Total: $${items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
      </div>
    `;
  }
}

class CartController {
  constructor(cart, eventBus) {
    this.cart = cart;
    this.eventBus = eventBus;
  
    // Connect UI events to cart methods
    this.eventBus.subscribe('ui:remove-item-clicked', itemId => {
      this.cart.removeItem(itemId);
    });
  
    // Log events for analytics
    this.eventBus.subscribe('cart:item-added', item => {
      console.log(`Analytics: Item added to cart - ${item.name}`);
    });
  
    this.eventBus.subscribe('cart:item-removed', item => {
      console.log(`Analytics: Item removed from cart - ${item.name}`);
    });
  }
}

// Usage
const eventBus = new EventBus();
const cart = new ShoppingCart(eventBus);
const cartUI = new CartUI(eventBus);
const cartController = new CartController(cart, eventBus);

// Add items to cart
cart.addItem({ id: 1, name: 'Product 1', price: 9.99 });
cart.addItem({ id: 2, name: 'Product 2', price: 19.99 });
```

This event bus implementation provides:

1. Loose coupling between components
2. A central communication mechanism
3. The ability to subscribe and unsubscribe from events
4. A clean separation of concerns (UI, business logic, etc.)

## 10. Advanced Event System Features

Finally, let's explore some advanced features for enterprise-level event systems:

```javascript
class AdvancedEventBus {
  constructor() {
    this.subscribers = {};
    this.middlewares = [];
  }
  
  // Add middleware for event processing
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  // Subscribe with optional options
  subscribe(event, callback, options = {}) {
    const { once = false, priority = 0 } = options;
  
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
  
    const subscriber = { callback, once, priority };
  
    // Insert based on priority (higher priority first)
    const index = this.subscribers[event].findIndex(s => s.priority < priority);
    if (index === -1) {
      this.subscribers[event].push(subscriber);
    } else {
      this.subscribers[event].splice(index, 0, subscriber);
    }
  
    // Return unsubscribe function
    return () => {
      const index = this.subscribers[event].indexOf(subscriber);
      if (index !== -1) {
        this.subscribers[event].splice(index, 1);
      }
    };
  }
  
  // Subscribe to be called only once
  once(event, callback, options = {}) {
    return this.subscribe(event, callback, { ...options, once: true });
  }
  
  // Publish an event with data
  async publish(event, data) {
    if (!this.subscribers[event]) {
      return;
    }
  
    // Create event object
    const eventObj = {
      type: event,
      data,
      timestamp: Date.now(),
      cancelled: false
    };
  
    // Process through middleware
    try {
      await this.runMiddlewares(eventObj);
    
      // If event was cancelled by middleware, stop processing
      if (eventObj.cancelled) {
        return;
      }
    
      // Clone array to allow subscribers to unsubscribe during iteration
      const subscribers = [...this.subscribers[event]];
    
      for (const subscriber of subscribers) {
        // Remove if it's a one-time subscription
        if (subscriber.once) {
          const index = this.subscribers[event].indexOf(subscriber);
          if (index !== -1) {
            this.subscribers[event].splice(index, 1);
          }
        }
      
        // Call the subscriber
        await subscriber.callback(eventObj.data, eventObj);
      }
    } catch (error) {
      console.error(`Error processing event "${event}":`, error);
      this.publish('error', { originalEvent: event, error });
    }
  }
  
  // Run middleware chain
  async runMiddlewares(eventObj) {
    let index = 0;
  
    const next = async () => {
      // If we've run out of middleware, just return
      if (index >= this.middlewares.length) {
        return;
      }
    
      const middleware = this.middlewares[index++];
      await middleware(eventObj, next);
    };
  
    await next();
  }
}

// Example middleware
const loggingMiddleware = async (event, next) => {
  const start = Date.now();
  console.log(`[${start}] Processing event: ${event.type}`);
  
  await next();
  
  const duration = Date.now() - start;
  console.log(`[${Date.now()}] Completed event: ${event.type} (${duration}ms)`);
};

const authMiddleware = async (event, next) => {
  // Check if event requires authentication
  if (event.type.startsWith('secure:') && !isUserAuthenticated()) {
    console.error('Unauthorized event access:', event.type);
    event.cancelled = true;
    return;
  }
  
  await next();
};

// Usage
const eventBus = new AdvancedEventBus();
eventBus.use(loggingMiddleware);
eventBus.use(authMiddleware);

// High priority subscription
eventBus.subscribe('user:login', (data) => {
  console.log('High priority handler:', data);
}, { priority: 10 });

// Normal priority subscription
eventBus.subscribe('user:login', (data) => {
  console.log('Normal priority handler:', data);
});

// One-time subscription
eventBus.once('user:login', (data) => {
  console.log('This will run only once:', data);
});

// Error handling
eventBus.subscribe('error', (data) => {
  console.error('Event error:', data.error, 'in event:', data.originalEvent);
});

// Dispatch event
eventBus.publish('user:login', { userId: 123, username: 'example' });
```

This advanced event system demonstrates:

1. Middleware for pre/post-processing events
2. Priority-based event handling
3. One-time event subscriptions
4. Error handling
5. Event cancellation

## 11. Cross-Component Communication

For a real-world application, let's combine several techniques to create a modular system with effective cross-component communication:

```javascript
class EventEmitter {
  static instance = null;
  
  // Singleton pattern
  static getInstance() {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter();
    }
    return EventEmitter.instance;
  }
  
  constructor() {
    this.events = {};
  }
  

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }
  
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }
  
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(data));
  }
}

// Application components
class ProductList {
  constructor() {
    this.eventEmitter = EventEmitter.getInstance();
    this.products = [];
  }
  
  loadProducts() {
    // Simulate API call
    this.products = [
      { id: 1, name: 'Laptop', price: 999 },
      { id: 2, name: 'Phone', price: 699 }
    ];
    
    this.eventEmitter.emit('products:loaded', this.products);
  }
  
  selectProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.eventEmitter.emit('product:selected', product);
    }
  }
}

class ShoppingCart {
  constructor() {
    this.eventEmitter = EventEmitter.getInstance();
    this.items = [];
    
    // Listen for product selection
    this.eventEmitter.on('product:selected', this.handleProductSelected.bind(this));
  }
  
  handleProductSelected(product) {
    this.addToCart(product);
  }
  
  addToCart(product) {
    this.items.push({...product, quantity: 1});
    this.eventEmitter.emit('cart:updated', this.items);
  }
}

// Initialize components
const productList = new ProductList();
const cart = new ShoppingCart();

// Load products
productList.loadProducts();

// User selects a product
productList.selectProduct(1);
```

This pattern enables completely decoupled components while maintaining communication via the shared event emitter.

## 12. Web Component Events

Web Components are a great use case for custom events:

```javascript
class CustomCounter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.count = 0;
  }
  
  connectedCallback() {
    this.render();
    this.addEventListeners();
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; padding: 10px; border: 1px solid #ccc; }
        button { margin: 0 5px; }
      </style>
      <div>
        <button id="decrease">-</button>
        <span id="count">${this.count}</span>
        <button id="increase">+</button>
      </div>
    `;
  }
  
  addEventListeners() {
    this.shadowRoot.getElementById('increase').addEventListener('click', () => {
      this.count++;
      this.update();
      
      // Dispatch custom event
      this.dispatchEvent(new CustomEvent('counter-changed', {
        bubbles: true,
        composed: true, // Important! Allows event to cross shadow DOM boundary
        detail: { count: this.count, direction: 'increase' }
      }));
    });
    
    this.shadowRoot.getElementById('decrease').addEventListener('click', () => {
      this.count--;
      this.update();
      
      this.dispatchEvent(new CustomEvent('counter-changed', {
        bubbles: true,
        composed: true,
        detail: { count: this.count, direction: 'decrease' }
      }));
    });
  }
  
  update() {
    this.shadowRoot.getElementById('count').textContent = this.count;
  }
}

// Register component
customElements.define('custom-counter', CustomCounter);

// Usage
document.getElementById('app').innerHTML = `
  <custom-counter></custom-counter>
  <div id="log"></div>
`;

// Listen for events
document.querySelector('custom-counter').addEventListener('counter-changed', e => {
  document.getElementById('log').innerHTML += `
    <p>Counter ${e.detail.direction}d to ${e.detail.count}</p>
  `;
});
```

Note the use of `composed: true` to allow events to cross the shadow DOM boundary.

## 13. Custom Event System with TypeScript

TypeScript can provide type safety for event systems:

```typescript
// Define event types
type EventMap = {
  'user:login': { userId: string, username: string };
  'user:logout': { userId: string };
  'notification:show': { message: string, type: 'success' | 'error' | 'info' };
  'app:ready': undefined;
}

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: {
    [K in keyof T]?: Array<(data: T[K]) => void>
  } = {};
  
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event]!.push(listener);
    
    return () => this.off(event, listener);
  }
  
  off<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event]!.filter(l => l !== listener);
  }
  
  emit<K extends keyof T>(event: K, data: T[K]) {
    if (!this.listeners[event]) return;
    
    this.listeners[event]!.forEach(listener => listener(data));
  }
}

// Usage
const events = new TypedEventEmitter<EventMap>();

// Type-safe event subscription
events.on('user:login', data => {
  console.log(`User ${data.username} logged in`);
});

// Error: Type '{userName: string}' is not assignable to type '{userId: string, username: string}'
// events.emit('user:login', { userName: 'john' });

// Correct usage
events.emit('user:login', { userId: '123', username: 'john' });
```

## 14. Asynchronous Event Processing

For handling events asynchronously:

```javascript
class AsyncEventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }
  
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }
  
  async emit(event, data) {
    if (!this.events[event]) return;
    
    // Process listeners in sequence
    for (const listener of this.events[event]) {
      await listener(data);
    }
  }
  
  // Process all listeners in parallel
  async emitParallel(event, data) {
    if (!this.events[event]) return;
    
    await Promise.all(
      this.events[event].map(listener => listener(data))
    );
  }
}

// Usage example
const emitter = new AsyncEventEmitter();

emitter.on('data:process', async data => {
  // Simulate a database save
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('Data processed:', data);
});

// Sequential processing
async function runSequential() {
  console.log('Starting sequential processing...');
  await emitter.emit('data:process', { id: 1 });
  await emitter.emit('data:process', { id: 2 });
  console.log('Sequential processing complete');
}

// Parallel processing
async function runParallel() {
  console.log('Starting parallel processing...');
  await emitter.emitParallel('data:process', { id: 3 });
  await emitter.emitParallel('data:process', { id: 4 });
  console.log('Parallel processing complete');
}

runSequential().then(() => runParallel());
```

## 15. Conclusion

Custom event systems are powerful tools for creating clean, decoupled architectures in front-end applications. From the foundational Observer pattern to advanced event bus implementations with middleware, events provide a flexible communication mechanism between components.

Key principles to remember:

1. **Events decouple components**: They allow communication without direct references
2. **The browser's built-in event system** is powerful but limited to DOM elements
3. **Event delegation** improves performance by reducing the number of event listeners
4. **Custom events** extend the browser's capabilities for application-specific needs
5. **Event buses** enable communication between unrelated components
6. **TypeScript** provides type safety for your event systems
7. **Asynchronous events** allow for complex, time-consuming operations

By mastering these patterns, you can create more maintainable, scalable front-end applications with clear separation of concerns.