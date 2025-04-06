# React's useImperativeHandle Hook: Understanding from First Principles

To thoroughly understand React's useImperativeHandle Hook, I'll start with fundamental concepts and progressively build to advanced applications with clear examples throughout.

## 1. The Problem: Accessing Component Internals

React's component model is primarily declarative and built around unidirectional data flow, where parent components pass props to children. This model works well for most use cases, but sometimes we need to imperatively interact with a component's internal functionality or DOM elements.

Consider these scenarios:

* You need to trigger focus on an input inside a complex component
* You want to programmatically start/pause a video player component
* You need to scroll a custom list component to a specific item
* You want to trigger animations on a component imperatively

In traditional DOM manipulation, you would directly access and manipulate elements:

```javascript
// Traditional imperative DOM manipulation
const videoElement = document.getElementById('video-player');
videoElement.play();
videoElement.volume = 0.5;
```

In React's component model, this becomes challenging because:

1. Component internals are encapsulated and not directly accessible
2. DOM elements are managed by React and might not always be present
3. Direct DOM manipulation bypasses React's reconciliation process

React provides the `ref` system to address this, but with limitations:

```javascript
function ParentComponent() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    // This only works if the input is directly accessible
    inputRef.current.focus();
  };
  
  return (
    <div>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
}
```

This works well for simple scenarios, but what if the input is nested inside a child component? How do we expose just the functionality we want without exposing the entire DOM element?

## 2. The Mental Model: Customizing Ref Exposure

The core mental model for useImperativeHandle is "customized ref exposure." Think of useImperativeHandle as giving you control over what a parent component can access when it attaches a ref to your component.

Instead of exposing the entire DOM node or component instance, you can create a custom API that:

1. Exposes only specific methods or properties
2. Adds custom behavior to those methods
3. Abstracts away implementation details

It's like creating a controlled interface for imperative actions, similar to how a public API hides internal implementation details.

## 3. The Basic Syntax and Required Setup

useImperativeHandle requires forwardRef to work correctly. Here's the basic syntax:

```javascript
import { useRef, useImperativeHandle, forwardRef } from 'react';

// Step 1: Use forwardRef to receive a ref from the parent
const ChildComponent = forwardRef((props, ref) => {
  // Step 2: Create internal refs as needed
  const internalRef = useRef(null);
  
  // Step 3: Use useImperativeHandle to customize the exposed ref
  useImperativeHandle(ref, () => ({
    // Step 4: Return an object with methods/properties to expose
    customMethod: () => {
      // Do something with internalRef
      console.log('Custom method called!');
      internalRef.current.focus();
    },
    anotherMethod: () => {
      console.log('Another method called!');
    }
  }));
  
  // Step 5: Render the component normally
  return <input ref={internalRef} />;
});

// Parent component that uses the custom imperative handle
function ParentComponent() {
  // Create a ref to attach to the child component
  const childRef = useRef(null);
  
  const handleClick = () => {
    // Access the exposed methods
    childRef.current.customMethod();
  };
  
  return (
    <div>
      <ChildComponent ref={childRef} />
      <button onClick={handleClick}>Call Custom Method</button>
    </div>
  );
}
```

Let's break down what's happening:

1. `forwardRef` creates a component that can receive a ref from its parent
2. Inside the component, we create our own internal refs as needed
3. `useImperativeHandle` links the forwarded ref with our custom object
4. We return an object with the methods we want to expose to the parent
5. The parent component can now call these methods via the ref

## 4. How useImperativeHandle Works Under the Hood

When React processes a useImperativeHandle Hook, it:

1. Receives the ref being forwarded from the parent component
2. Calls the factory function to create the custom object
3. Assigns this custom object to the `current` property of the forwarded ref
4. Re-runs this process when dependencies change, updating the ref's value

This allows the parent component to interact with the child through a controlled, customized interface rather than having direct access to DOM elements or the entire component instance.

## 5. A Simple Example: Custom Input Component

Let's implement a practical example - a custom input component that exposes specific functionality:

```javascript
import { useRef, useImperativeHandle, forwardRef, useState } from 'react';

const CustomInput = forwardRef((props, ref) => {
  // Internal state and refs
  const [value, setValue] = useState(props.defaultValue || '');
  const inputRef = useRef(null);
  
  // Handle input changes
  const handleChange = (e) => {
    setValue(e.target.value);
    if (props.onChange) {
      props.onChange(e);
    }
  };
  
  // Expose selected functionality to the parent
  useImperativeHandle(ref, () => ({
    // Expose a focus method
    focus: () => {
      inputRef.current.focus();
    },
    // Expose a method to clear the input
    clear: () => {
      setValue('');
      inputRef.current.focus();
    },
    // Expose a method to get the current value
    getValue: () => {
      return value;
    },
    // Expose a method to set the value programmatically
    setValue: (newValue) => {
      setValue(newValue);
    }
  }));
  
  return (
    <input
      ref={inputRef}
      value={value}
      onChange={handleChange}
      className={props.className}
      placeholder={props.placeholder}
    />
  );
});

// Using the custom input
function FormWithCustomInput() {
  const inputRef = useRef(null);
  
  const handleFocusClick = () => {
    inputRef.current.focus();
  };
  
  const handleClearClick = () => {
    inputRef.current.clear();
  };
  
  const handleGetValueClick = () => {
    alert(`Current value: ${inputRef.current.getValue()}`);
  };
  
  const handleSetValueClick = () => {
    inputRef.current.setValue('Programmatically set text');
  };
  
  return (
    <div>
      <CustomInput
        ref={inputRef}
        defaultValue="Initial text"
        placeholder="Type something..."
      />
      <div>
        <button onClick={handleFocusClick}>Focus</button>
        <button onClick={handleClearClick}>Clear</button>
        <button onClick={handleGetValueClick}>Get Value</button>
        <button onClick={handleSetValueClick}>Set Value</button>
      </div>
    </div>
  );
}
```

This example demonstrates several key benefits:

1. The parent component can't directly access the DOM input element
2. We expose only the specific methods we want to allow
3. We can add additional behavior to those methods (like focusing after clearing)
4. The implementation details are hidden from the parent

## 6. Common useImperativeHandle Patterns

### Pattern 1: Media Controls

```javascript
const VideoPlayer = forwardRef((props, ref) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useImperativeHandle(ref, () => ({
    play: () => {
      videoRef.current.play();
      setIsPlaying(true);
    },
    pause: () => {
      videoRef.current.pause();
      setIsPlaying(false);
    },
    toggle: () => {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    },
    seekTo: (time) => {
      videoRef.current.currentTime = time;
    },
    get currentTime() {
      return videoRef.current ? videoRef.current.currentTime : 0;
    },
    get duration() {
      return videoRef.current ? videoRef.current.duration : 0;
    }
  }));
  
  return (
    <div className="video-player">
      <video 
        ref={videoRef} 
        src={props.src} 
        controls={props.showControls}
      />
      {!props.showControls && (
        <div className="custom-controls">
          <button onClick={() => ref.current.toggle()}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      )}
    </div>
  );
});

// Using the video player
function VideoGallery() {
  const videoRef = useRef(null);
  
  return (
    <div>
      <VideoPlayer 
        ref={videoRef}
        src="https://example.com/video.mp4"
        showControls={false}
      />
      <div className="gallery-controls">
        <button onClick={() => videoRef.current.play()}>Play</button>
        <button onClick={() => videoRef.current.pause()}>Pause</button>
        <button onClick={() => videoRef.current.seekTo(0)}>Restart</button>
        <button onClick={() => videoRef.current.seekTo(videoRef.current.duration / 2)}>
          Jump to Middle
        </button>
      </div>
    </div>
  );
}
```

This pattern is ideal for creating custom media players where the parent needs to control playback.

### Pattern 2: Form Validation and Submission

```javascript
const AdvancedForm = forwardRef((props, ref) => {
  const [values, setValues] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const messageInputRef = useRef(null);
  
  const validate = () => {
    const newErrors = {};
  
    if (!values.name) {
      newErrors.name = 'Name is required';
    }
  
    if (!values.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Email is invalid';
    }
  
    if (!values.message) {
      newErrors.message = 'Message is required';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (field, value) => {
    setValues({
      ...values,
      [field]: value
    });
  
    // Clear the error when the user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined
      });
    }
  };
  
  useImperativeHandle(ref, () => ({
    // Check if the form is valid
    validate,
  
    // Get form values
    getValues: () => values,
  
    // Submit the form
    submit: () => {
      if (validate()) {
        console.log('Form submitted with:', values);
        return true;
      } else {
        // Focus the first field with an error
        if (errors.name) {
          nameInputRef.current.focus();
        } else if (errors.email) {
          emailInputRef.current.focus();
        } else if (errors.message) {
          messageInputRef.current.focus();
        }
        return false;
      }
    },
  
    // Reset the form
    reset: () => {
      setValues({
        name: '',
        email: '',
        message: ''
      });
      setErrors({});
    },
  
    // Focus a specific field
    focusField: (fieldName) => {
      if (fieldName === 'name') {
        nameInputRef.current.focus();
      } else if (fieldName === 'email') {
        emailInputRef.current.focus();
      } else if (fieldName === 'message') {
        messageInputRef.current.focus();
      }
    }
  }));
  
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label>Name:</label>
        <input
          ref={nameInputRef}
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        {errors.name && <div className="error">{errors.name}</div>}
      </div>
    
      <div>
        <label>Email:</label>
        <input
          ref={emailInputRef}
          type="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        {errors.email && <div className="error">{errors.email}</div>}
      </div>
    
      <div>
        <label>Message:</label>
        <textarea
          ref={messageInputRef}
          value={values.message}
          onChange={(e) => handleChange('message', e.target.value)}
        />
        {errors.message && <div className="error">{errors.message}</div>}
      </div>
    </form>
  );
});

// Using the advanced form
function ContactPage() {
  const formRef = useRef(null);
  
  const handleSubmit = () => {
    if (formRef.current.submit()) {
      alert('Form submitted successfully!');
    } else {
      alert('Please fix the errors in the form.');
    }
  };
  
  return (
    <div className="contact-page">
      <h1>Contact Us</h1>
      <AdvancedForm ref={formRef} />
      <div className="form-actions">
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={() => formRef.current.reset()}>Reset</button>
      </div>
    </div>
  );
}
```

This pattern allows complex form handling where the parent controls submission but the internal validation logic remains encapsulated.

### Pattern 3: Complex UI Components with Imperative Actions

```javascript
const Accordion = forwardRef((props, ref) => {
  const [openSections, setOpenSections] = useState(
    props.defaultOpenSections || []
  );
  
  const sectionRefs = useRef({});
  
  const toggleSection = (sectionId) => {
    setOpenSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };
  
  const scrollToSection = (sectionId) => {
    if (sectionRefs.current[sectionId]) {
      sectionRefs.current[sectionId].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  
  useImperativeHandle(ref, () => ({
    // Open a specific section
    openSection: (sectionId) => {
      if (!openSections.includes(sectionId)) {
        setOpenSections(prev => [...prev, sectionId]);
      }
      scrollToSection(sectionId);
    },
  
    // Close a specific section
    closeSection: (sectionId) => {
      setOpenSections(prev => prev.filter(id => id !== sectionId));
    },
  
    // Toggle a specific section
    toggleSection,
  
    // Open all sections
    openAll: () => {
      const allSectionIds = props.sections.map(section => section.id);
      setOpenSections(allSectionIds);
    },
  
    // Close all sections
    closeAll: () => {
      setOpenSections([]);
    },
  
    // Get currently open sections
    getOpenSections: () => openSections
  }));
  
  return (
    <div className="accordion">
      {props.sections.map(section => (
        <div 
          key={section.id} 
          className="accordion-section"
          ref={el => sectionRefs.current[section.id] = el}
        >
          <div 
            className="accordion-header"
            onClick={() => toggleSection(section.id)}
          >
            {section.title}
            <span>{openSections.includes(section.id) ? '▲' : '▼'}</span>
          </div>
        
          {openSections.includes(section.id) && (
            <div className="accordion-content">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

// Using the accordion
function FAQPage() {
  const accordionRef = useRef(null);
  const sections = [
    { id: 'basics', title: 'Basics', content: '...' },
    { id: 'account', title: 'Account', content: '...' },
    { id: 'payment', title: 'Payment', content: '...' },
    { id: 'delivery', title: 'Delivery', content: '...' }
  ];
  
  return (
    <div>
      <h1>Frequently Asked Questions</h1>
    
      <div className="faq-controls">
        <button onClick={() => accordionRef.current.openAll()}>
          Expand All
        </button>
        <button onClick={() => accordionRef.current.closeAll()}>
          Collapse All
        </button>
      </div>
    
      <div className="quick-links">
        <button onClick={() => accordionRef.current.openSection('payment')}>
          Jump to Payment Info
        </button>
        <button onClick={() => accordionRef.current.openSection('delivery')}>
          Jump to Delivery Info
        </button>
      </div>
    
      <Accordion
        ref={accordionRef}
        sections={sections}
        defaultOpenSections={['basics']}
      />
    </div>
  );
}
```

This pattern is perfect for complex UI components that need to expose imperative actions to parent components.

## 7. Using Dependencies with useImperativeHandle

Just like other hooks, useImperativeHandle accepts a dependencies array as its third argument:

```javascript
const CounterInput = forwardRef((props, ref) => {
  const [count, setCount] = useState(0);
  const inputRef = useRef(null);
  
  useImperativeHandle(
    ref,
    () => ({
      // These methods depend on the current count value
      increment: () => setCount(count + 1),
      decrement: () => setCount(Math.max(0, count - 1)),
      getCount: () => count,
      focus: () => inputRef.current.focus()
    }),
    [count] // Dependency array - regenerate when count changes
  );
  
  return (
    <div>
      <input
        ref={inputRef}
        type="number"
        value={count}
        onChange={(e) => setCount(parseInt(e.target.value) || 0)}
      />
    </div>
  );
});
```

When the dependencies change, the function is re-run and a new object is created, updating what the parent can access. This ensures that:

1. The parent always has access to methods that work with current state
2. Closures in your methods don't capture stale values
3. Performance is optimized by not recreating the object unnecessarily

The dependencies array follows the same rules as useEffect and other hooks, capturing any values from the component scope that are used inside the imperative handle.

## 8. Advanced useImperativeHandle Techniques

### Technique 1: Combining Multiple Refs

Sometimes you need to expose functionality from multiple internal components:

```javascript
const MultiPartForm = forwardRef((props, ref) => {
  // Refs for different parts of the form
  const personalInfoRef = useRef(null);
  const addressInfoRef = useRef(null);
  const paymentInfoRef = useRef(null);
  
  // Combine functionality from multiple sources
  useImperativeHandle(ref, () => ({
    // Validate the entire form
    validate: () => {
      const personalValid = personalInfoRef.current.validate();
      const addressValid = addressInfoRef.current.validate();
      const paymentValid = paymentInfoRef.current.validate();
    
      return personalValid && addressValid && paymentValid;
    },
  
    // Submit all sections
    submit: () => {
      if (!ref.current.validate()) return false;
    
      const formData = {
        personal: personalInfoRef.current.getValues(),
        address: addressInfoRef.current.getValues(),
        payment: paymentInfoRef.current.getValues()
      };
    
      console.log('Submitting form with data:', formData);
      return true;
    },
  
    // Focus a specific section
    focusSection: (section) => {
      if (section === 'personal') {
        personalInfoRef.current.focus();
      } else if (section === 'address') {
        addressInfoRef.current.focus();
      } else if (section === 'payment') {
        paymentInfoRef.current.focus();
      }
    },
  
    // Get values from all sections
    getAllValues: () => ({
      personal: personalInfoRef.current.getValues(),
      address: addressInfoRef.current.getValues(),
      payment: paymentInfoRef.current.getValues()
    })
  }));
  
  return (
    <form>
      <PersonalInfoSection ref={personalInfoRef} />
      <AddressInfoSection ref={addressInfoRef} />
      <PaymentInfoSection ref={paymentInfoRef} />
    </form>
  );
});
```

This technique lets you compose functionality from multiple internal components into a unified API.

### Technique 2: Dynamic Method Generation

For components with repetitive patterns, you can dynamically generate methods:

```javascript
const TabPanel = forwardRef((props, ref) => {
  const [activeTab, setActiveTab] = useState(props.defaultActiveTab || 0);
  const tabRefs = useRef([]);
  
  // Populate tab refs array when tabs change
  useEffect(() => {
    tabRefs.current = Array(props.tabs.length).fill().map((_, i) => 
      tabRefs.current[i] || React.createRef()
    );
  }, [props.tabs]);
  
  useImperativeHandle(ref, () => {
    // Create a base object with common methods
    const methods = {
      activateTab: (index) => {
        if (index >= 0 && index < props.tabs.length) {
          setActiveTab(index);
          return true;
        }
        return false;
      },
      getActiveTab: () => activeTab,
      getTabCount: () => props.tabs.length
    };
  
    // Dynamically add methods for each tab
    props.tabs.forEach((tab, index) => {
      // Add a method to activate each specific tab
      methods[`activateTab${index}`] = () => methods.activateTab(index);
    
      // Add methods that call through to the tab component if it exposes a ref
      if (tabRefs.current[index] && tabRefs.current[index].current) {
        const tabRef = tabRefs.current[index].current;
      
        // If the tab exposes a scrollToTop method, add it
        if (tabRef.scrollToTop) {
          methods[`scrollTab${index}ToTop`] = () => tabRef.scrollToTop();
        }
      
        // If the tab exposes a refresh method, add it
        if (tabRef.refresh) {
          methods[`refreshTab${index}`] = () => tabRef.refresh();
        }
      }
    });
  
    return methods;
  }, [activeTab, props.tabs]);
  
  return (
    <div className="tab-panel">
      <div className="tab-headers">
        {props.tabs.map((tab, index) => (
          <button
            key={index}
            className={activeTab === index ? 'active' : ''}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    
      <div className="tab-content">
        {props.tabs.map((tab, index) => (
          <div
            key={index}
            style={{ display: activeTab === index ? 'block' : 'none' }}
          >
            {tab.render(tabRefs.current[index])}
          </div>
        ))}
      </div>
    </div>
  );
});
```

This creates a dynamically generated API based on the current structure of your component.

### Technique 3: Conditional Method Exposure

Sometimes you want to expose different methods based on props:

```javascript
const ConfigurableComponent = forwardRef((props, ref) => {
  const internalRef = useRef(null);
  
  // Expose different methods based on props
  useImperativeHandle(ref, () => {
    const methods = {
      // Always expose these methods
      reset: () => {
        // Reset logic...
      },
      focus: () => {
        internalRef.current.focus();
      }
    };
  
    // Only expose edit methods if the component is editable
    if (props.editable) {
      methods.startEditing = () => {
        // Start editing logic...
      };
    
      methods.saveChanges = () => {
        // Save changes logic...
      };
    }
  
    // Only expose debug methods in development
    if (process.env.NODE_ENV === 'development') {
      methods.getDebugInfo = () => {
        // Return internal state for debugging
      };
    }
  
    return methods;
  }, [props.editable]);
  
  return <div ref={internalRef}>{/* Component content */}</div>;
});
```

This technique creates adaptable APIs that change based on component configuration.

## 9. Common useImperativeHandle Pitfalls and Solutions

### Pitfall 1: Creating a New Object on Every Render

```javascript
// 🔴 Incorrect - missing dependency array
const BadComponent = forwardRef((props, ref) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  
  // This creates a new object on EVERY render!
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    getValue: () => value
  })); // No dependency array!
  
  return <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)} />;
});
```

Solution: Always include a dependency array:

```javascript
// ✅ Correct - with proper dependency array
const GoodComponent = forwardRef((props, ref) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  
  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current.focus(),
      getValue: () => value
    }),
    [value] // Only recreate when value changes
  );
  
  return <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)} />;
});
```

### Pitfall 2: Stale Closures in Imperative Methods

```javascript
// 🔴 Incorrect - stale closure problem
const CounterWithStaleClosures = forwardRef((props, ref) => {
  const [count, setCount] = useState(0);
  
  // This creates a closure over the initial count value
  useImperativeHandle(ref, () => ({
    increment: () => setCount(count + 1),
    getCount: () => count
  }), []); // Empty dependency array!
  
  return <div>Count: {count}</div>;
});
```

Solution: Include values in the dependency array or use functional updates:

```javascript
// ✅ Solution 1: Include the value in dependencies
const CounterWithProperDeps = forwardRef((props, ref) => {
  const [count, setCount] = useState(0);
  
  useImperativeHandle(ref, () => ({
    increment: () => setCount(count + 1),
    getCount: () => count
  }), [count]); // Regenerate when count changes
  
  return <div>Count: {count}</div>;
});

// ✅ Solution 2: Use functional updates
const CounterWithFunctionalUpdates = forwardRef((props, ref) => {
  const [count, setCount] = useState(0);
  
  useImperativeHandle(ref, () => ({
    increment: () => setCount(prevCount => prevCount + 1),
    getCount: () => count
  }), [count]); // Still need count for getCount to be current
  
  return <div>Count: {count}</div>;
});
```

### Pitfall 3: Overexposing Implementation Details

```javascript
// 🔴 Incorrect - exposing too much
const OverexposedComponent = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  
  // This exposes the entire DOM node
  useImperativeHandle(ref, () => ({
    domNode: inputRef.current, // DON'T do this!
    // ...other methods
  }), []);
  
  return <input ref={inputRef} />;
});
```

Solution: Only expose specific functionality, not underlying elements:

```javascript
// ✅ Correct - exposing only necessary functionality
const WellEncapsulatedComponent = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    blur: () => inputRef.current.blur(),
    select: () => inputRef.current.select()
    // DON'T expose the DOM node itself
  }), []);
  
  return <input ref={inputRef} />;
});
```

## 10. A Complete Real-World Example

Let's build a comprehensive example that demonstrates useImperativeHandle in a complex scenario - a reusable data grid component:

```javascript
import { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

const DataGrid = forwardRef((props, ref) => {
  // State for internal grid operations
  const [sortField, setSortField] = useState(props.defaultSortField || '');
  const [sortDirection, setSortDirection] = useState(props.defaultSortDirection || 'asc');
  const [selectedRows, setSelectedRows] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [page, setPage] = useState(props.defaultPage || 1);
  const [rowsPerPage, setRowsPerPage] = useState(props.defaultRowsPerPage || 10);
  const [filterValues, setFilterValues] = useState({});
  
  // Refs for internal elements
  const gridRef = useRef(null);
  const headerRefs = useRef({});
  const rowRefs = useRef({});
  const searchInputRef = useRef(null);
  
  // Process data with current sort, filter, and pagination
  const processedData = useRef([]);
  
  // Process data whenever relevant parameters change
  useEffect(() => {
    let result = [...props.data];
  
    // Apply filters
    Object.entries(filterValues).forEach(([field, value]) => {
      if (value) {
        result = result.filter(row => 
          String(row[field]).toLowerCase().includes(String(value).toLowerCase())
        );
      }
    });
  
    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
    
        if (typeof aValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === 'asc' ? comparison : -
```
