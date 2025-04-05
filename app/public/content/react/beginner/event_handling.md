# Event Handling in React: A Comprehensive Guide

Event handling is a fundamental aspect of building interactive React applications. It's how we capture and respond to user interactions like clicks, key presses, form submissions, and more. Let's explore this concept deeply, starting from first principles.

## The Core Concept of Events in React

At its most basic level, an event is something that happens in the browser - a user clicks a button, types in a text field, or moves their mouse. React provides a way to intercept these browser events and handle them with JavaScript functions.

React's event system is a wrapper around the browser's native event system, offering a synthetic event system with a few key advantages:

1. **Cross-browser compatibility** : React normalizes events so they behave consistently across different browsers
2. **Automatic cleanup** : React handles event listener cleanup to prevent memory leaks
3. **Event pooling** : React reuses event objects for performance (though this has been removed in React 17+)
4. **Consistent interface** : The API is consistent with DOM events but adheres to camelCase naming convention

## Basic Event Handling Syntax

Let's start with a simple example of handling a click event:

```jsx
function Button() {
  const handleClick = () => {
    console.log('Button was clicked!');
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

The key elements here are:

1. The event handler is a function (`handleClick`)
2. The event is attached using a camelCase naming convention (`onClick` instead of `onclick`)
3. We pass a reference to the function, not a function call (no parentheses after `handleClick`)

This is different from HTML where you might write:

```html
<button onclick="handleClick()">Click me</button>
```

## Event Handler Patterns

There are several ways to define event handlers in React components:

### 1. Inline Function Definitions

```jsx
function Button() {
  return (
    <button onClick={() => {
      console.log('Button was clicked!');
    }}>
      Click me
    </button>
  );
}
```

This approach is convenient for simple handlers but can lead to unnecessary re-renders in some cases because a new function is created on each render.

### 2. Method Defined in the Component Body

```jsx
function Button() {
  // Function is defined once per component instance
  const handleClick = () => {
    console.log('Button was clicked!');
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

This is often the preferred approach as it's clean and doesn't create a new function on each render.

### 3. Passing Parameters to Event Handlers

Sometimes you need to pass additional data to your event handler:

```jsx
function ItemList({ items }) {
  const handleItemClick = (itemId) => {
    console.log(`Item ${itemId} was clicked!`);
  };

  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => handleItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

Notice we're using an arrow function in the `onClick` attribute. This is necessary when passing parameters because we need to create a new function that calls our handler with the specific parameters.

### 4. Using useCallback for Memoized Event Handlers

For performance optimization, especially when passing handlers to child components, you can use `useCallback`:

```jsx
import React, { useCallback } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // This function will only be recreated if dependencies change
  const handleClick = useCallback(() => {
    setCount(count + 1);
  }, [count]);
  
  return (
    <div>
      <p>Count: {count}</p>
      <ChildButton onClick={handleClick} />
    </div>
  );
}

// Using React.memo to prevent unnecessary renders
const ChildButton = React.memo(function ChildButton({ onClick }) {
  console.log("ChildButton rendered");
  return <button onClick={onClick}>Increment</button>;
});
```

In this example, `useCallback` memoizes the `handleClick` function, so it's not recreated on every render unless `count` changes. This helps prevent unnecessary re-renders of the `ChildButton` component.

## The Synthetic Event Object

When an event occurs, React passes a synthetic event object to your event handler. This object is a cross-browser wrapper around the native browser event:

```jsx
function InputExample() {
  const handleChange = (event) => {
    console.log('Input value:', event.target.value);
    console.log('Event type:', event.type);
    console.log('Target element:', event.target);
  };

  return <input onChange={handleChange} />;
}
```

The event object provides methods like:

* `preventDefault()`: Prevents the default browser behavior
* `stopPropagation()`: Stops the event from bubbling up through parent elements
* Properties like `target`, `currentTarget`, `type`, etc.

## Preventing Default Behavior

Many browser events have default behaviors - forms submit and reload the page, links navigate, etc. You can prevent these behaviors using `preventDefault()`:

```jsx
function Form() {
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent page reload
    console.log('Form submitted!');
    // Handle form submission logic here
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Understanding Event Propagation

Browser events propagate in two phases:

1. **Capture phase** : From window down to the target element
2. **Bubble phase** : From the target element back up to the window

By default, React event handlers are registered for the bubble phase. If you click a nested element, the event will "bubble up" through its parent elements:

```jsx
function Nested() {
  const handleParentClick = () => {
    console.log('Parent div clicked');
  };

  const handleChildClick = (event) => {
    console.log('Child button clicked');
    // Comment this line to see bubbling in action
    event.stopPropagation();
  };

  return (
    <div onClick={handleParentClick} style={{padding: '20px', background: 'lightgray'}}>
      Parent Div
      <button onClick={handleChildClick} style={{margin: '10px'}}>
        Child Button
      </button>
    </div>
  );
}
```

If you click the button, both click handlers will fire unless you call `event.stopPropagation()` in the child handler.

### Capture Phase Event Handlers

React also allows registering handlers for the capture phase by appending `Capture` to the event name:

```jsx
function CaptureExample() {
  const handleClickCapture = () => {
    console.log('Capture phase: Parent div');
  };

  const handleClick = () => {
    console.log('Bubble phase: Parent div');
  };

  const handleButtonClickCapture = () => {
    console.log('Capture phase: Button');
  };

  const handleButtonClick = () => {
    console.log('Bubble phase: Button');
  };

  return (
    <div 
      onClick={handleClick} 
      onClickCapture={handleClickCapture}
      style={{padding: '20px', background: 'lightgray'}}
    >
      Parent Div
      <button 
        onClick={handleButtonClick} 
        onClickCapture={handleButtonClickCapture}
        style={{margin: '10px'}}
      >
        Click me
      </button>
    </div>
  );
}
```

When you click the button, the events fire in this order:

1. Capture phase: Parent div
2. Capture phase: Button
3. Bubble phase: Button
4. Bubble phase: Parent div

This matches the DOM event propagation model.

## Common React Events

React supports all the standard DOM events. Here are some of the most commonly used ones:

### Mouse Events

* `onClick`: Triggered when an element is clicked
* `onMouseEnter` / `onMouseLeave`: Triggered when the mouse enters or leaves an element
* `onMouseDown` / `onMouseUp`: Triggered when a mouse button is pressed or released

### Keyboard Events

* `onKeyDown` / `onKeyUp`: Triggered when a key is pressed or released
* `onKeyPress`: Triggered when a key that produces a character is pressed (deprecated in newer browsers)

### Form Events

* `onChange`: Triggered when the value of an input element changes
* `onSubmit`: Triggered when a form is submitted
* `onFocus` / `onBlur`: Triggered when an element gains or loses focus

### Touch Events

* `onTouchStart` / `onTouchEnd`: Triggered when a touch point is placed on or removed from the screen
* `onTouchMove`: Triggered when a touch point is moved along the screen

## Handling Forms in React

Form handling is one of the most common uses of events in React applications. Let's look at a comprehensive form example:

```jsx
import React, { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  
  // Generic change handler for all inputs
  const handleChange = (event) => {
    const { name, value } = event.target;
  
    // Update the form data
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
  
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
  
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
  
    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
  
    if (validateForm()) {
      console.log('Form submitted with data:', formData);
      // Here you would typically send the data to a server
      alert('Form submitted successfully!');
    
      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <span style={{color: 'red'}}>{errors.name}</span>}
      </div>
    
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span style={{color: 'red'}}>{errors.email}</span>}
      </div>
    
      <div>
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
        />
        {errors.message && <span style={{color: 'red'}}>{errors.message}</span>}
      </div>
    
      <button type="submit">Submit</button>
    </form>
  );
}
```

This form example demonstrates several important concepts:

* A generic `handleChange` function that works for all inputs
* Form validation
* Error display
* Form submission with `preventDefault()`

## Event Delegation in React

React implements event delegation automatically for performance. Instead of attaching event listeners to each individual DOM element, React attaches a single listener at the document level and uses its synthetic event system to determine which component should receive the event.

This pattern is highly efficient, as it:

1. Reduces memory usage by having fewer actual DOM event listeners
2. Simplifies dynamic element handling, as you don't need to manually attach/detach listeners
3. Makes the code cleaner by handling events declaratively

## Custom Events in React

React doesn't have a built-in custom event system like the DOM's `CustomEvent`. Instead, React uses props to create a similar pattern. Parent components pass callback functions to child components, and the child components call these functions when specific events occur:

```jsx
// Child component
function ToggleSwitch({ isOn, onToggle }) {
  return (
    <div className="toggle-switch">
      <button 
        onClick={onToggle}
        className={isOn ? 'on' : 'off'}
      >
        {isOn ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}

// Parent component
function LightController() {
  const [isLightOn, setIsLightOn] = useState(false);
  
  const handleToggle = () => {
    setIsLightOn(prevState => !prevState);
    console.log('Light switched to:', !isLightOn ? 'ON' : 'OFF');
  };
  
  return (
    <div>
      <h2>Light Control</h2>
      <ToggleSwitch isOn={isLightOn} onToggle={handleToggle} />
    </div>
  );
}
```

In this pattern, the `onToggle` prop is like a custom event that the `ToggleSwitch` component can trigger.

## Event Handling with Class Components

While functional components with hooks are more common today, it's still important to understand how event handling works in class components:

```jsx
import React, { Component } from 'react';

class ClickCounter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  
    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
  }
  
  // Alternatively, use an arrow function class property (requires Babel setup)
  handleReset = () => {
    this.setState({ count: 0 });
  }
  
  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleClick}>Increment</button>
        <button onClick={this.handleReset}>Reset</button>
      </div>
    );
  }
}
```

Note the two different approaches to handling the `this` context:

1. Binding the method in the constructor
2. Using class property arrow functions (which automatically bind `this`)

## Advanced Event Handling Patterns

### 1. Debouncing and Throttling Events

For performance-sensitive events like scroll, resize, or input, you might want to limit how often your handlers run:

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create a debounced function that only runs after 500ms of inactivity
  const debouncedSetSearchTerm = useCallback(
    debounce(term => {
      setDebouncedTerm(term);
    }, 500),
    [] // Empty dependency array so it's only created once
  );
  
  // Update the search term immediately for the UI
  const handleChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  
    // Call the debounced function which will update after 500ms
    debouncedSetSearchTerm(value);
  };
  
  // Effect to handle searching with the debounced term
  useEffect(() => {
    const searchAPI = async () => {
      if (!debouncedTerm) {
        setResults([]);
        return;
      }
    
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        const response = await fetch(`/api/search?q=${debouncedTerm}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    searchAPI();
  }, [debouncedTerm]);
  
  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder="Search..."
      />
      {isLoading && <p>Loading...</p>}
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

This approach ensures your search API isn't called on every keystroke, but only after the user pauses typing.

### 2. Event Handling in Portals

React portals allow you to render children into a DOM node outside the parent component's hierarchy. This is useful for modals, tooltips, etc. Events still bubble up according to the React component tree, not the DOM tree:

```jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

function Modal({ isOpen, onClose, children }) {
  const [modalRoot] = useState(() => {
    const root = document.createElement('div');
    root.className = 'modal-root';
    return root;
  });
  
  useEffect(() => {
    // Append to body when the component mounts
    document.body.appendChild(modalRoot);
  
    // Clean up when the component unmounts
    return () => {
      document.body.removeChild(modalRoot);
    };
  }, [modalRoot]);
  
  // Modal event handling
  const handleBackdropClick = (event) => {
    // Only close if clicking the backdrop, not the modal content
    if (event.target === event.currentTarget) {
      onClose();
    }
  };
  
  // Don't render anything if the modal is closed
  if (!isOpen) return null;
  
  // Use createPortal to render into the separate DOM node
  return ReactDOM.createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>,
    modalRoot
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  return (
    <div className="app">
      <h1>React Portal Modal Example</h1>
      <button onClick={openModal}>Open Modal</button>
    
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>Modal Content</h2>
        <p>This content is rendered outside the normal DOM hierarchy.</p>
      </Modal>
    </div>
  );
}
```

Even though the modal DOM elements are rendered outside the `App` component's DOM hierarchy, the events still bubble up according to the React component tree, making event handling intuitive.

### 3. Global Event Listeners

Sometimes you need to listen for events that happen outside your React components, like keyboard shortcuts:

```jsx
import React, { useState, useEffect } from 'react';

function KeyboardShortcuts() {
  const [lastPressed, setLastPressed] = useState('None');
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Handle Command/Ctrl + S keyboard shortcut
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault(); // Prevent browser save dialog
        console.log('Save shortcut pressed');
        setLastPressed('Ctrl+S or Cmd+S');
      }
    
      // Handle Escape key
      if (event.key === 'Escape') {
        console.log('Escape pressed');
        setLastPressed('Escape');
      }
    };
  
    // Add global event listener
    window.addEventListener('keydown', handleKeyDown);
  
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty array ensures this only runs once on mount
  
  return (
    <div>
      <h2>Keyboard Shortcuts Demo</h2>
      <p>Try pressing: Ctrl+S (or Cmd+S) or Escape</p>
      <p>Last shortcut pressed: <strong>{lastPressed}</strong></p>
    </div>
  );
}
```

This pattern is useful for implementing application-wide shortcuts or listening for events that might occur outside your React components.

## Common Event Handling Pitfalls and Solutions

### 1. The "this" Binding Issue in Class Components

One of the most common issues in class components is forgetting to bind event handlers to `this`:

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props);
    // Missing: this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    // This will crash because 'this' is undefined
    this.setState({ clicked: true });
  }
  
  render() {
    return <button onClick={this.handleClick}>Click Me</button>;
  }
}
```

Solutions:

1. Bind in the constructor: `this.handleClick = this.handleClick.bind(this);`
2. Use class property arrow functions: `handleClick = () => { this.setState({ clicked: true }); }`
3. Bind inline in render: `onClick={() => this.handleClick()}` (not recommended due to performance)

### 2. Creating New Function References on Each Render

```jsx
function BadExample() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      {/* Creates a new function on every render */}
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ExpensiveComponent onClick={() => console.log('Clicked')} />
    </div>
  );
}
```

The issue here is that a new function is created on each render, which can cause performance problems, especially when passing to child components that might re-render unnecessarily.

Solutions:

1. Define the function outside the JSX: `const handleClick = () => setCount(count + 1);`
2. Use `useCallback`: `const handleClick = useCallback(() => setCount(count + 1), [count]);`

### 3. Not Using Event Delegation for Large Lists

When dealing with large lists, attaching event handlers to each item can be inefficient:

```jsx
function IneffientList({ items }) {
  // Each item gets its own onClick handler
  return (
    <ul>
      {items.map(item => (
        <li 
          key={item.id} 
          onClick={() => console.log(`Clicked item ${item.id}`)}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

Solution: Use a single handler on the parent element and identify which item was clicked:

```jsx
function EfficientList({ items }) {
  const handleItemClick = (event) => {
    // Find the closest LI element
    const li = event.target.closest('li');
    if (li) {
      const itemId = li.dataset.id;
      console.log(`Clicked item ${itemId}`);
    }
  };
  
  return (
    <ul onClick={handleItemClick}>
      {items.map(item => (
        <li 
          key={item.id} 
          data-id={item.id}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

This approach is more efficient for very large lists.

### 4. Forgetting to Call preventDefault

Not calling `preventDefault()` on form submissions is a common mistake that causes page reloads:

```jsx
function Form() {
  const handleSubmit = () => {
    console.log('Form submitted');
    // Missing: event.preventDefault();
    // The page will reload, losing the console message
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

Solution: Remember to call `preventDefault()` on events with default behaviors:

```jsx
function Form() {
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent page reload
    console.log('Form submitted');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Testing Event Handlers

Testing event handlers is an important part of ensuring your components work correctly. Here's how you might test the earlier `ContactForm` example using React Testing Library:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import ContactForm from './ContactForm';

test('submits the form with valid data', () => {
  // Mock the console.log function to check if it's called
  console.log = jest.fn();
  
  // Render the form
  render(<ContactForm />);
  
  // Fill out the form fields
  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: 'John Doe' }
  });
  
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'john@example.com' }
  });
  
  fireEvent.change(screen.getByLabelText(/message/i), {
    target: { value: 'Hello, this is a test message.' }
  });
  
  // Submit the form
  fireEvent.click(screen.getByText(/submit/i));
  
  // Check if console.log was called with the form data
  expect(console.log).toHaveBeenCalledWith(
    'Form submitted with data:',
    {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello, this is a test message.'
    }
  );
});

test('shows validation errors for empty fields', () => {
  // Render the form
  render(<ContactForm />);
  
  // Submit the empty form
  fireEvent.click(screen.getByText(/submit/i));
  
  // Check if validation errors are displayed
  expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  expect(screen.getByText(/message is required/i)).toBeInTheDocument();
});
```

This approach tests both the happy path (valid submission) and error handling (validation).

## Event Handling in Complex Applications

In larger applications, you might want to adopt more structured approaches to event handling:

### 1. Using Finite State Machines

For complex interactions, consider using state machines to model your component's behavior:

```jsx
import { useState } from 'react';

const STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

const EVENTS = {
  FETCH: 'fetch',
  RESOLVE: 'resolve',
  REJECT: 'reject',
  RESET: 'reset'
};

// State transition map
const stateTransitions = {
  [STATES.IDLE]: {
    [EVENTS.FETCH]: STATES.LOADING
  },
  [STATES.LOADING]: {
    [EVENTS.RESOLVE]: STATES.SUCCESS,
    [EVENTS.REJECT]: STATES.ERROR
  },
  [STATES.SUCCESS]: {
    [EVENTS.RESET]: STATES.IDLE,
    [EVENTS.FETCH]: STATES.LOADING
  },
  [STATES.ERROR]: {
    [EVENTS.RESET]: STATES.IDLE,
    [EVENTS.FETCH]: STATES.LOADING
  }
};

function DataFetchingComponent() {
  const [state, setState] = useState(STATES.IDLE);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  // Event dispatcher
  const dispatch = (event) => {
    const currentState = state;
    const nextState = stateTransitions[currentState][event];
  
    if (nextState) {
      setState(nextState);
      return true;
    }
    return false;
  };
  
  const fetchData = async () => {
    // Only proceed if we can transition to loading state
    if (!dispatch(EVENTS.FETCH)) return;
  
    try {
      const response = await fetch('https://api.example.com/data');
      const result = await response.json();
    
      setData(result);
      dispatch(EVENTS.RESOLVE);
    } catch (err) {
      setError(err.message);
      dispatch(EVENTS.REJECT);
    }
  };
  
  const reset = () => {
    dispatch(EVENTS.RESET);
    setData(null);
    setError(null);
  };
  
  // Render different UI based on state
  return (
    <div>
      <h2>Data Fetching Example</h2>
    
      {state === STATES.IDLE && (
        <button onClick={fetchData}>Fetch Data</button>
      )}
    
      {state === STATES.LOADING && (
        <p>Loading...</p>
      )}
    
      {state === STATES.SUCCESS && (
        <>
          <p>Data loaded successfully!</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <button onClick={reset}>Reset</button>
          <button onClick={fetchData}>Fetch Again</button>
        </>
      )}
    
      {state === STATES.ERROR && (
        <>
          <p>Error: {error}</p>
          <button onClick={reset}>Reset</button>
          <button onClick={fetchData}>Try Again</button>
        </>
      )}
    </div>
  );
}
```

This state machine approach makes complex interactions more predictable and easier to debug.

### 2. Using Custom Hooks for Event Logic

Extract event handling logic into custom hooks for reusability:

```jsx
import { useState } from 'react';

// Custom hook for form handling
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };
  
  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched({ ...touched, [name]: true });
  
    // Validate on blur
    if (validate) {
      const fieldErrors = validate(values);
      setErrors(prev => ({ ...prev, ...fieldErrors }));
    }
  };
  
  const handleSubmit = async (event, onSubmit) => {
    event.preventDefault();
    
    // Validate all fields before submission
    if (validate) {
      const formErrors = validate(values);
      setErrors(formErrors);
      
      // Mark all fields as touched
      const allTouched = Object.keys(initialValues).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);
      
      // Don't proceed if there are errors
      if (Object.keys(formErrors).length > 0) {
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the provided onSubmit function with form values
      await onSubmit(values);
      // Reset form after successful submission if needed
      // setValues(initialValues);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };
  
  return {
    values,
    setValues,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  };
}
```

Now we can use this hook in any form component:

```jsx
function SignupForm() {
  const validate = (values) => {
    const errors = {};
    
    if (!values.username) {
      errors.username = 'Username is required';
    }
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      errors.email = 'Email address is invalid';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    return errors;
  };
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  } = useForm(
    { username: '', email: '', password: '' },
    validate
  );
  
  const submitForm = async (formData) => {
    // Simulate API call
    console.log('Submitting form data:', formData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Signup successful!');
    reset();
  };
  
  return (
    <form onSubmit={(e) => handleSubmit(e, submitForm)}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.username && errors.username && (
          <div className="error">{errors.username}</div>
        )}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.email && errors.email && (
          <div className="error">{errors.email}</div>
        )}
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.password && errors.password && (
          <div className="error">{errors.password}</div>
        )}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

This approach encapsulates all the complex form event handling logic in a reusable hook, making our form components cleaner and more focused.

## Handling Events in Context Providers

For application-wide event handling, you can create context providers that manage events and provide handlers to their children:

```jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

// Create a context for the modal system
const ModalContext = createContext();

function ModalProvider({ children }) {
  const [modals, setModals] = useState({
    // Example modals
    login: { isOpen: false, data: null },
    confirmation: { isOpen: false, data: null },
    alert: { isOpen: false, data: null }
  });
  
  // Open a modal with optional data
  const openModal = useCallback((modalName, data = null) => {
    setModals(prevModals => ({
      ...prevModals,
      [modalName]: { isOpen: true, data }
    }));
  }, []);
  
  // Close a specific modal
  const closeModal = useCallback((modalName) => {
    setModals(prevModals => ({
      ...prevModals,
      [modalName]: { isOpen: false, data: null }
    }));
  }, []);
  
  // Close all open modals
  const closeAllModals = useCallback(() => {
    const closedModals = Object.keys(modals).reduce((acc, modalName) => {
      acc[modalName] = { isOpen: false, data: null };
      return acc;
    }, {});
    
    setModals(closedModals);
  }, [modals]);
  
  // Event handler for escape key to close modals
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      closeAllModals();
    }
  }, [closeAllModals]);
  
  // Add global event listener for keyboard events
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Context value to provide to consumers
  const contextValue = {
    modals,
    openModal,
    closeModal,
    closeAllModals
  };
  
  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
}

// Custom hook to use the modal context
function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

// Usage example in a component
function App() {
  return (
    <ModalProvider>
      <Header />
      <MainContent />
      <Footer />
      <ModalSystem />
    </ModalProvider>
  );
}

// Component to render the actual modals
function ModalSystem() {
  const { modals, closeModal } = useModal();
  
  return (
    <>
      {modals.login.isOpen && (
        <LoginModal onClose={() => closeModal('login')} data={modals.login.data} />
      )}
      
      {modals.confirmation.isOpen && (
        <ConfirmationModal onClose={() => closeModal('confirmation')} data={modals.confirmation.data} />
      )}
      
      {modals.alert.isOpen && (
        <AlertModal onClose={() => closeModal('alert')} data={modals.alert.data} />
      )}
    </>
  );
}

// Example component that triggers a modal
function Header() {
  const { openModal } = useModal();
  
  const handleLoginClick = () => {
    openModal('login');
  };
  
  return (
    <header>
      <h1>My App</h1>
      <button onClick={handleLoginClick}>Log In</button>
    </header>
  );
}
```

This pattern provides a centralized system for handling modal-related events throughout your application. Similar approaches can be used for other application-wide concerns like notifications, auth state, themes, etc.

## Event Handling with React Hooks

Let's explore some more advanced applications of hooks for event handling:

### Using useReducer for Complex Event Handling

For components with complex state transitions in response to events, `useReducer` provides a more structured approach:

```jsx
import React, { useReducer, useEffect } from 'react';

// Action types
const ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  RESET: 'RESET',
  SET_FILTER: 'SET_FILTER',
  SET_SORT: 'SET_SORT'
};

// Initial state
const initialState = {
  data: [],
  isLoading: false,
  error: null,
  filter: '',
  sortBy: 'name'
};

// Reducer function
function dataReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        data: action.payload
      };
    case ACTIONS.FETCH_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case ACTIONS.RESET:
      return initialState;
    case ACTIONS.SET_FILTER:
      return {
        ...state,
        filter: action.payload
      };
    case ACTIONS.SET_SORT:
      return {
        ...state,
        sortBy: action.payload
      };
    default:
      return state;
  }
}

function DataTable() {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { data, isLoading, error, filter, sortBy } = state;
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: ACTIONS.FETCH_START });
      
      try {
        const response = await fetch('https://api.example.com/data');
        const result = await response.json();
        dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: result });
      } catch (error) {
        dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
      }
    };
    
    fetchData();
  }, []);
  
  // Event handlers
  const handleFilterChange = (event) => {
    dispatch({ 
      type: ACTIONS.SET_FILTER, 
      payload: event.target.value 
    });
  };
  
  const handleSortChange = (event) => {
    dispatch({ 
      type: ACTIONS.SET_SORT, 
      payload: event.target.value 
    });
  };
  
  const handleReset = () => {
    dispatch({ type: ACTIONS.RESET });
  };
  
  // Filter and sort the data
  const processedData = data
    .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      }
      return 0;
    });
  
  return (
    <div>
      <div className="controls">
        <input
          type="text"
          placeholder="Filter by name..."
          value={filter}
          onChange={handleFilterChange}
        />
        
        <select value={sortBy} onChange={handleSortChange}>
          <option value="name">Sort by Name</option>
          <option value="date">Sort by Date</option>
        </select>
        
        <button onClick={handleReset}>Reset</button>
      </div>
      
      {isLoading && <p>Loading data...</p>}
      
      {error && <p className="error">Error: {error}</p>}
      
      {!isLoading && !error && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

The `useReducer` hook provides a more predictable way to handle complex state changes triggered by different events, making the component easier to maintain as complexity grows.

### Creating a Custom useEventListener Hook

To simplify working with event listeners, we can create a custom hook:

```jsx
import { useEffect, useRef } from 'react';

function useEventListener(eventName, handler, element = window, options = {}) {
  // Create a ref that stores the handler
  const savedHandler = useRef();
  
  // Update ref.current value if handler changes
  // This allows our effect below to always get latest handler
  // without us needing to pass it in effect deps array
  // and potentially cause effect to re-run every render
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    // Make sure element supports addEventListener
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;
    
    // Create event listener that calls handler function stored in ref
    const eventListener = event => savedHandler.current(event);
    
    // Add event listener
    element.addEventListener(eventName, eventListener, options);
    
    // Remove event listener on cleanup
    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]); // Re-run if these dependencies change
}
```

This hook allows us to easily add and remove event listeners:

```jsx
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  
  // Create an event handler
  const handleScroll = () => {
    setScrollY(window.scrollY);
  };
  
  // Use our custom hook
  useEventListener('scroll', handleScroll);
  
  return (
    <div style={{ position: 'fixed', top: '10px', right: '10px' }}>
      Scroll position: {scrollY}px
    </div>
  );
}
```

### useClickOutside Hook for Common UI Patterns

For UI elements like dropdowns, we often need to detect clicks outside the element:

```jsx
import { useEffect, useRef } from 'react';

function useClickOutside(handler) {
  const ref = useRef();
  
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      
      handler(event);
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
  
  return ref;
}
```

Now we can easily implement a dropdown:

```jsx
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);
  
  // Use the click outside hook
  const dropdownRef = useClickOutside(closeDropdown);
  
  return (
    <div className="dropdown" ref={dropdownRef}>
      <button onClick={toggleDropdown}>
        Menu {isOpen ? '▲' : '▼'}
      </button>
      
      {isOpen && (
        <ul className="dropdown-menu">
          <li><a href="#profile">Profile</a></li>
          <li><a href="#settings">Settings</a></li>
          <li><a href="#logout">Logout</a></li>
        </ul>
      )}
    </div>
  );
}
```

## Performance Optimization for Event Handlers

When working with frequently-triggered events like scrolling, mouse movement, or window resizing, performance becomes critical. Here are some techniques to optimize event handlers:

### 1. Throttling and Debouncing

These techniques limit how often your event handlers run. Here's an implementation using the `useEffect` and `useCallback` hooks:

```jsx
import { useState, useEffect, useCallback } from 'react';

// Custom hook for debounced values
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    // Set debouncedValue to value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Cancel the timeout if value or delay changes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Custom hook for throttled functions
function useThrottle(callback, delay) {
  const [lastCalled, setLastCalled] = useState(0);
  
  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastCalled >= delay) {
      callback(...args);
      setLastCalled(now);
    }
  }, [callback, delay, lastCalled]);
}

// Usage example
function WindowResizeTracker() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [inputValue, setInputValue] = useState('');
  const debouncedValue = useDebounce(inputValue, 500);
  
  // Update window size, but throttled to once per 200ms
  const handleResize = useThrottle(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
    console.log('Resize handler executed');
  }, 200);
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);
  
  // Effect runs when debounced value changes
  useEffect(() => {
    console.log('Searching for:', debouncedValue);
    // This would be where you make an API call
  }, [debouncedValue]);
  
  return (
    <div>
      <p>Window width: {windowSize.width}px</p>
      <p>Window height: {windowSize.height}px</p>
      
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search (debounced)..."
      />
      <p>Debounced value: {debouncedValue}</p>
    </div>
  );
}
```

### 2. Using requestAnimationFrame for Smooth Animations

For visual updates, using `requestAnimationFrame` can improve performance:

```jsx
import { useState, useRef, useEffect, useCallback } from 'react';

function SmoothCounter() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(0);
  const frameRef = useRef();
  
  // Smoothly animate the counter to the target value
  const animateCount = useCallback(() => {
    // Calculate the next value (move 10% closer to target each frame)
    const diff = target - count;
    if (Math.abs(diff) < 0.1) {
      setCount(target);
      return;
    }
    
    setCount(prev => prev + diff * 0.1);
    
    // Request the next frame
    frameRef.current = requestAnimationFrame(animateCount);
  }, [count, target]);
  
  // Start animation when target changes
  useEffect(() => {
    frameRef.current = requestAnimationFrame(animateCount);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, animateCount]);
  
  // Button event handlers
  const increment = () => setTarget(prev => prev + 100);
  const decrement = () => setTarget(prev => prev - 100);
  
  return (
    <div>
      <h2>Smooth Counter: {Math.round(count)}</h2>
      <button onClick={increment}>+100</button>
      <button onClick={decrement}>-100</button>
    </div>
  );
}
```

This approach creates smoother animations by using the browser's animation frame timing rather than forcing updates in a way that might cause jank.

### 3. Using the Intersection Observer API

For scroll-based effects, the Intersection Observer API is more efficient than scroll event listeners:

```jsx
import { useState, useRef, useEffect } from 'react';

function IntersectionDemo() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state when intersection status changes
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% visible
      }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);
  
  return (
    <div>
      <div style={{ height: '100vh' }}>
        Scroll down to see the effect
      </div>
      
      <div
        ref={ref}
        style={{
          height: '300px',
          background: isVisible ? 'green' : 'red',
          transition: 'background-color 0.5s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px'
        }}
      >
        {isVisible ? 'Element is visible!' : 'Element is hidden'}
      </div>
      
      <div style={{ height: '100vh' }}>
        Scroll up to see the effect again
      </div>
    </div>
  );
}
```

This approach is much more performant than using scroll events, as the browser only calls your callback when the visibility status changes.

## Advanced Event Patterns

### 1. Event Delegation with Data Attributes

When working with lists of items, you can use data attributes and event delegation for efficient event handling:

```jsx
function TaskList() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build a project', completed: false },
    { id: 3, text: 'Deploy to production', completed: false }
  ]);
  
  // Single event handler for all tasks
  const handleTaskClick = (event) => {
    // Find the task element and get its ID
    const taskElement = event.target.closest('[data-task-id]');
    if (!taskElement) return;
    
    const taskId = Number(taskElement.dataset.taskId);
    
    // Check if the click was on the complete button
    if (event.target.classList.contains('complete-btn')) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
    }
    
    // Check if the click was on the delete button
    else if (event.target.classList.contains('delete-btn')) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    }
  };
  
  return (
    <ul onClick={handleTaskClick}>
      {tasks.map(task => (
        <li
          key={task.id}
          data-task-id={task.id}
          style={{ 
            textDecoration: task.completed ? 'line-through' : 'none',
            margin: '10px 0'
          }}
        >
          {task.text}
          <button className="complete-btn" style={{ marginLeft: '10px' }}>
            {task.completed ? 'Undo' : 'Complete'}
          </button>
          <button className="delete-btn" style={{ marginLeft: '10px' }}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

This approach is very efficient because:
1. It uses a single event listener for all items
2. It works even for items added after the initial render
3. It allows for more complex targeting via element classes

### 2. Pointer Events for Touch and Mouse

For interactions that need to work across both mouse and touch devices, the Pointer Events API provides a unified approach:

```jsx
function DrawingCanvas() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set up canvas
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    
    const handlePointerDown = (e) => {
      setIsDrawing(true);
      const { offsetX, offsetY } = e;
      lastPointRef.current = { x: offsetX, y: offsetY };
    };
    
    const handlePointerMove = (e) => {
      if (!isDrawing) return;
      
      const { offsetX, offsetY } = e;
      const currentPoint = { x: offsetX, y: offsetY };
      
      // Draw line from last point to current point
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
      
      lastPointRef.current = currentPoint;
    };
    
    const handlePointerUp = () => {
      setIsDrawing(false);
    };
    
    const handlePointerLeave = () => {
      setIsDrawing(false);
    };
    
    // Add event listeners
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    
    // Clean up
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [isDrawing]);
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        style={{
          border: '1px solid #000',
          touchAction: 'none' // Prevent scrolling on touch devices
        }}
      />
      <button onClick={clearCanvas}>Clear</button>
    </div>
  );
}
```

Note the use of `touchAction: 'none'` to prevent the default touch behaviors like scrolling, which would interfere with drawing.

### 3. Keyboard Accessibility

Ensuring your event handling is accessible for keyboard users is crucial:

```jsx
function AccessibleMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef(null);
  const menuItems = ['Profile', 'Settings', 'Help', 'Logout'];
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const handleItemClick = (index) => {
    console.log(`Selected: ${menuItems[index]}`);
    setIsOpen(false);
    setActiveIndex(-1);
  };
  
  const handleKeyDown = (event) => {
    if (!isOpen) return;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(prev => (prev < menuItems.length - 1 ? prev + 1 : 0));
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : menuItems.length - 1));
        break;
        
      case 'Enter':
      case ' ': // Space
        event.preventDefault();
        if (activeIndex >= 0) {
          handleItemClick(activeIndex);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
        
      default:
        break;
    }
  };
  
  // Focus the active item when it changes
  useEffect(() => {
    if (activeIndex >= 0 && menuRef.current) {
      const menuItemElements = menuRef.current.querySelectorAll('.menu-item');
      if (menuItemElements[activeIndex]) {
        menuItemElements[activeIndex].focus();
      }
    }
  }, [activeIndex]);
  
// Close the menu when clicking outside
    useEffect(() => {
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
        }
    };
    
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
    }, [isOpen]);

return (
  <div className="dropdown-container">
    <button 
      aria-haspopup="true"
      aria-expanded={isOpen}
      onClick={toggleMenu}
      onKeyDown={handleKeyDown}
    >
      Menu ▼
    </button>
    
    {isOpen && (
      <ul 
        ref={menuRef}
        className="menu"
        role="menu"
        onKeyDown={handleKeyDown}
      >
        {menuItems.map((item, index) => (
          <li 
            key={item}
            role="menuitem"
            tabIndex={0}
            className={`menu-item ${index === activeIndex ? 'active' : ''}`}
            onClick={() => handleItemClick(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleItemClick(index);
              }
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    )}
  </div>
);
```

This menu implementation is fully keyboard accessible:
- Users can open the menu with Enter or Space on the menu button
- Arrow keys navigate between menu items
- Enter or Space selects the current item
- Escape closes the menu
- Proper ARIA attributes help screen readers understand the menu structure

### 4. Working with Drag and Drop

The HTML5 Drag and Drop API provides native browser support for drag and drop interactions:

```jsx
import React, { useState, useRef } from 'react';

function DragAndDropList() {
  const [items, setItems] = useState([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
    { id: 4, text: 'Item 4' }
  ]);
  
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    // Set a custom drag image
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', items[index].text);
    
    // Add dragging class after a small delay
    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  };
  
  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
    
    // Add visual feedback for drop target
    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach(item => item.classList.remove('drag-over'));
    e.target.closest('.list-item').classList.add('drag-over');
  };
  
  const handleDragOver = (e) => {
    // Prevent default to allow drop
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    
    // Remove drag-over class from all items
    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach(item => item.classList.remove('drag-over'));
    
    // If item was dropped onto itself, do nothing
    if (dragItem.current === dragOverItem.current) return;
    
    // Reorder the items
    const itemsCopy = [...items];
    const draggedItem = itemsCopy[dragItem.current];
    
    // Remove the dragged item
    itemsCopy.splice(dragItem.current, 1);
    
    // Insert at the new position
    itemsCopy.splice(dragOverItem.current, 0, draggedItem);
    
    // Update state with the new order
    setItems(itemsCopy);
    
    // Reset references
    dragItem.current = null;
    dragOverItem.current = null;
  };
  
  return (
    <div>
      <h2>Drag and Drop List</h2>
      <ul className="drag-list">
        {items.map((item, index) => (
          <li 
            key={item.id}
            className="list-item"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <span className="drag-handle">≡</span>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

For this to work properly, you'd need some CSS:

```css
.drag-list {
  list-style: none;
  padding: 0;
}

.list-item {
  padding: 10px;
  margin: 5px 0;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: grab;
  display: flex;
  align-items: center;
}

.drag-handle {
  margin-right: 10px;
  font-size: 20px;
  color: #999;
}

.dragging {
  opacity: 0.5;
}

.drag-over {
  border: 2px dashed #666;
  background: #e0e0e0;
}
```

This implementation provides a smooth drag and drop experience with visual feedback. For more complex drag and drop requirements, you might want to consider libraries like `react-beautiful-dnd` or `react-dnd`.

## Event Handling in React 18 and Beyond

React 18 introduced several new features that affect event handling, particularly around concurrent rendering and automatic batching.

### Automatic Batching in React 18

React 18 expands automatic batching to include all state updates, not just those within event handlers:

```jsx
// In React 17, only updates within event handlers are batched
function handleClick() {
  // These will be batched into a single render
  setCount(c => c + 1);
  setFlag(f => !f);
}

// In React 17, these are NOT batched and cause two renders
function handleClickAsync() {
  fetch('/api').then(() => {
    // These cause separate renders in React 17
    // But in React 18, they're automatically batched
    setCount(c => c + 1);
    setFlag(f => !f);
  });
}
```

In React 18, both synchronous and asynchronous updates are batched by default, improving performance by reducing unnecessary re-renders.

If you need to force an update to happen immediately, you can use `flushSync`:

```jsx
import { flushSync } from 'react-dom';

function handleClick() {
  // This first update is applied immediately
  flushSync(() => {
    setCount(c => c + 1);
  });
  
  // This starts a new batch
  setFlag(f => !f);
}
```

### Transitions for Non-Urgent Updates

React 18 introduces transitions, which allow you to mark updates as non-urgent:

```jsx
import { useTransition, useState } from 'react';

function SearchInput() {
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleChange = (e) => {
    // Update the input immediately
    setInputValue(e.target.value);
    
    // Mark the search query update as non-urgent
    startTransition(() => {
      setSearchQuery(e.target.value);
    });
  };
  
  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Search..."
      />
      
      {isPending ? (
        <p>Updating results...</p>
      ) : (
        <SearchResults query={searchQuery} />
      )}
    </div>
  );
}
```

Transitions are particularly useful for expensive operations that might cause the UI to feel sluggish. By marking them as non-urgent, React can prioritize more important updates like input handling.

### React 18 and Event Handlers

For event handlers specifically, the main change in React 18 is that they are now part of the new React event model with improved performance and automatic batching. Most of your existing event handling code should work the same way, with performance benefits coming for free.

## Building an Event-Driven Architecture in React

For large applications, you might want to consider a more formal event-driven architecture. This approach can help decouple components and make the application more maintainable.

### 1. Event Emitter Pattern

You can create a simple event system using React Context:

```jsx
import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';

// Create event context
const EventContext = createContext();

function EventProvider({ children }) {
  // Store event listeners
  const [listeners, setListeners] = useState({});
  
  // Add a listener for an event
  const on = useCallback((eventName, callback) => {
    setListeners(prevListeners => {
      const eventListeners = prevListeners[eventName] || [];
      return {
        ...prevListeners,
        [eventName]: [...eventListeners, callback]
      };
    });
    
    // Return a function to remove this listener
    return () => {
      setListeners(prevListeners => {
        const eventListeners = prevListeners[eventName] || [];
        return {
          ...prevListeners,
          [eventName]: eventListeners.filter(cb => cb !== callback)
        };
      });
    };
  }, []);
  
  // Emit an event with data
  const emit = useCallback((eventName, data) => {
    const eventListeners = listeners[eventName] || [];
    eventListeners.forEach(callback => {
      callback(data);
    });
  }, [listeners]);
  
  const value = { on, emit };
  
  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

// Custom hook to use the event system
function useEvent() {
  return useContext(EventContext);
}

// Custom hook to listen for events
function useEventListener(eventName, callback) {
  const { on } = useEvent();
  
  useEffect(() => {
    // Subscribe to the event
    const unsubscribe = on(eventName, callback);
    
    // Unsubscribe when component unmounts or dependencies change
    return unsubscribe;
  }, [on, eventName, callback]);
}

// Now you can use these in your components:

function CartButton() {
  const { emit } = useEvent();
  const [cartItems, setCartItems] = useState([]);
  
  const addToCart = (product) => {
    const updatedCart = [...cartItems, product];
    setCartItems(updatedCart);
    
    // Emit an event that other components can listen for
    emit('cart:updated', {
      items: updatedCart,
      itemCount: updatedCart.length
    });
  };
  
  return (
    <button onClick={() => addToCart({ id: 1, name: 'Product' })}>
      Add to Cart
    </button>
  );
}

function CartIndicator() {
  const [itemCount, setItemCount] = useState(0);
  
  // Listen for cart update events
  useEventListener('cart:updated', (data) => {
    setItemCount(data.itemCount);
  });
  
  return <div>Cart Items: {itemCount}</div>;
}

// Use the provider at the app level
function App() {
  return (
    <EventProvider>
      <CartButton />
      <CartIndicator />
    </EventProvider>
  );
}
```

This pattern allows components to communicate without direct prop passing or complex state management, which can be particularly useful in large applications.

### 2. Command Pattern

For more complex actions, you can implement a command pattern:

```jsx
import React, { createContext, useContext, useReducer } from 'react';

// Define command types
const COMMANDS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  CHECKOUT: 'CHECKOUT'
};

// Command handlers
const commandHandlers = {
  [COMMANDS.ADD_TO_CART]: (state, payload) => {
    const { product } = payload;
    return {
      ...state,
      cart: [...state.cart, product]
    };
  },
  
  [COMMANDS.REMOVE_FROM_CART]: (state, payload) => {
    const { productId } = payload;
    return {
      ...state,
      cart: state.cart.filter(item => item.id !== productId)
    };
  },
  
  [COMMANDS.CLEAR_CART]: (state) => {
    return {
      ...state,
      cart: []
    };
  },
  
  [COMMANDS.CHECKOUT]: (state) => {
    // In a real app, this would trigger API calls, etc.
    return {
      ...state,
      cart: [],
      orderHistory: [...state.orderHistory, { items: state.cart, date: new Date() }]
    };
  }
};

// Command reducer
function commandReducer(state, action) {
  const { type, payload } = action;
  const handler = commandHandlers[type];
  
  if (handler) {
    return handler(state, payload);
  }
  
  return state;
}

// Initial state
const initialState = {
  cart: [],
  orderHistory: []
};

// Create command context
const CommandContext = createContext();

function CommandProvider({ children }) {
  const [state, dispatch] = useReducer(commandReducer, initialState);
  
  // Execute a command
  const execute = (commandType, payload) => {
    dispatch({ type: commandType, payload });
  };
  
  const value = { state, execute };
  
  return (
    <CommandContext.Provider value={value}>
      {children}
    </CommandContext.Provider>
  );
}

// Custom hook to use commands
function useCommand() {
  return useContext(CommandContext);
}

// Component using commands
function ProductItem({ product }) {
  const { execute } = useCommand();
  
  const handleAddToCart = () => {
    execute(COMMANDS.ADD_TO_CART, { product });
  };
  
  return (
    <div className="product">
      <h3>{product.name}</h3>
      <p>${product.price.toFixed(2)}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}

function CartSummary() {
  const { state, execute } = useCommand();
  
  const handleCheckout = () => {
    execute(COMMANDS.CHECKOUT);
  };
  
  const handleClearCart = () => {
    execute(COMMANDS.CLEAR_CART);
  };
  
  const handleRemoveItem = (productId) => {
    execute(COMMANDS.REMOVE_FROM_CART, { productId });
  };
  
  return (
    <div className="cart">
      <h2>Cart ({state.cart.length} items)</h2>
      
      <ul>
        {state.cart.map(item => (
          <li key={item.id}>
            {item.name} - ${item.price.toFixed(2)}
            <button onClick={() => handleRemoveItem(item.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      
      <div className="cart-actions">
        <button onClick={handleClearCart}>Clear Cart</button>
        <button onClick={handleCheckout}>Checkout</button>
      </div>
    </div>
  );
}

// App using the command system
function App() {
  return (
    <CommandProvider>
      <div className="app">
        <h1>Online Store</h1>
        <ProductList />
        <CartSummary />
      </div>
    </CommandProvider>
  );
}
```

The command pattern provides a structured way to handle complex interactions while keeping the code maintainable.

## Conclusion: Mastering Event Handling in React

Event handling is a fundamental aspect of building interactive React applications. Throughout this guide, we've explored the full spectrum of event handling techniques, from basic click handlers to advanced patterns for large applications.

The key principles to remember:

1. **React's Synthetic Events** provide a cross-browser wrapper around native browser events, offering consistency and performance advantages.

2. **Event Handler Functions** should typically be defined in the component body rather than inline in JSX to avoid unnecessary re-renders.

3. **Event Propagation** follows the DOM model with capture and bubble phases, and React provides ways to control this behavior.

4. **Performance Optimization** is crucial, especially for frequently-triggered events. Techniques like debouncing, throttling, and using specialized APIs like Intersection Observer are valuable tools.

5. **Accessibility** should be a core consideration when implementing event handlers, ensuring keyboard navigation and proper ARIA attributes.

6. **Custom Hooks** can encapsulate event-related logic, making it reusable across components.

7. **State Management** is closely tied to event handling, and choosing the right pattern (useState, useReducer, or external libraries) depends on the complexity of your application.

8. **Modern React Features** like automatic batching and transitions can help optimize event handling in React 18 and beyond.

By mastering these principles and techniques, you can create responsive, performant, and accessible React applications that provide excellent user experiences.

Remember that good event handling is as much about design patterns and architecture as it is about the specific React APIs. As your applications grow in complexity, consider more structured approaches like the event emitter or command patterns to maintain code quality and developer productivity.