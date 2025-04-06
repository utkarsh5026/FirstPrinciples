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
          return sortDirection === 'asc' ? comparison : -comparison;
        } else {
          const comparison = aValue - bValue;
          return sortDirection === 'asc' ? comparison : -comparison;
        }
      });
    }
    
    processedData.current = result;
  }, [props.data, sortField, sortDirection, filterValues]);
  
  // Get paginated data
  const getPaginatedData = () => {
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return processedData.current.slice(startIdx, endIdx);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(processedData.current.length / rowsPerPage);
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle row selection
  const handleRowSelect = (rowId) => {
    setSelectedRows(prev => {
      if (prev.includes(rowId)) {
        return prev.filter(id => id !== rowId);
      } else {
        return [...prev, rowId];
      }
    });
  };
  
  // Handle row expansion
  const handleRowExpand = (rowId) => {
    setExpandedRows(prev => {
      if (prev.includes(rowId)) {
        return prev.filter(id => id !== rowId);
      } else {
        return [...prev, rowId];
      }
    });
  };
  
  // Apply a filter
  const applyFilter = (field, value) => {
    setFilterValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset to first page when filtering
    setPage(1);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilterValues({});
    setPage(1);
  };
  
  // Handle page change
  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  // Expose imperative handle to parent
  useImperativeHandle(ref, () => ({
    // Data access methods
    getData: () => processedData.current,
    getSelectedRows: () => selectedRows.map(id => props.data.find(row => row.id === id)),
    getPaginatedData,
    getCurrentPage: () => page,
    getTotalPages: () => totalPages,
    
    // Navigation methods
    goToPage: (pageNumber) => changePage(pageNumber),
    nextPage: () => changePage(page + 1),
    prevPage: () => changePage(page - 1),
    firstPage: () => changePage(1),
    lastPage: () => changePage(totalPages),
    
    // Selection methods
    selectRow: (rowId) => {
      if (!selectedRows.includes(rowId)) {
        setSelectedRows(prev => [...prev, rowId]);
      }
    },
    deselectRow: (rowId) => {
      setSelectedRows(prev => prev.filter(id => id !== rowId));
    },
    selectAll: () => {
      setSelectedRows(props.data.map(row => row.id));
    },
    clearSelection: () => {
      setSelectedRows([]);
    },
    
    // Expansion methods
    expandRow: (rowId) => {
      if (!expandedRows.includes(rowId)) {
        setExpandedRows(prev => [...prev, rowId]);
      }
    },
    collapseRow: (rowId) => {
      setExpandedRows(prev => prev.filter(id => id !== rowId));
    },
    expandAll: () => {
      setExpandedRows(props.data.map(row => row.id));
    },
    collapseAll: () => {
      setExpandedRows([]);
    },
    
    // Filtering methods
    setFilter: applyFilter,
    clearFilter: (field) => {
      setFilterValues(prev => {
        const newFilters = { ...prev };
        delete newFilters[field];
        return newFilters;
      });
    },
    clearAllFilters: clearFilters,
    
    // Sorting methods
    sortBy: (field, direction = 'asc') => {
      setSortField(field);
      setSortDirection(direction);
    },
    toggleSortDirection: () => {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    },
    
    // Focus methods
    focusCell: (rowId, columnName) => {
      if (rowRefs.current[rowId] && headerRefs.current[columnName]) {
        // Find the cell index
        const columnIndex = Object.keys(headerRefs.current).indexOf(columnName);
        
        if (columnIndex !== -1 && rowRefs.current[rowId].cells[columnIndex]) {
          rowRefs.current[rowId].cells[columnIndex].focus();
          
          // Also scroll into view if needed
          rowRefs.current[rowId].cells[columnIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }
    },
    
    focusSearch: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    },
    
    // UI methods
    scrollToRow: (rowId) => {
      if (rowRefs.current[rowId]) {
        rowRefs.current[rowId].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    },
    
    // Export methods
    exportToCSV: () => {
      const headers = props.columns.map(col => col.header).join(',');
      const rows = processedData.current.map(row => 
        props.columns.map(col => String(row[col.field]).replace(/,/g, ' ')).join(',')
      );
      
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export.csv';
      a.click();
      
      URL.revokeObjectURL(url);
    }
  }), [
    props.data,
    props.columns,
    processedData.current,
    selectedRows,
    expandedRows,
    page,
    totalPages,
    rowsPerPage
  ]);
  
  // Render paginated data
  const displayData = getPaginatedData();
  
  return (
    <div className="data-grid-container" ref={gridRef}>
      <div className="data-grid-search">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search..."
          onChange={(e) => applyFilter('_global', e.target.value)}
        />
        <button onClick={clearFilters}>Clear Filters</button>
      </div>
      
      <table className="data-grid">
        <thead>
          <tr>
            <th className="selection-cell">
              <input
                type="checkbox"
                checked={selectedRows.length === props.data.length}
                onChange={() => 
                  selectedRows.length === props.data.length 
                    ? setSelectedRows([]) 
                    : setSelectedRows(props.data.map(row => row.id))
                }
              />
            </th>
            <th className="expansion-cell"></th>
            {props.columns.map(column => (
              <th 
                key={column.field}
                ref={el => headerRefs.current[column.field] = el}
                onClick={() => handleSort(column.field)}
                className={sortField === column.field ? `sorted-${sortDirection}` : ''}
              >
                {column.header}
                {sortField === column.field && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
          {props.showColumnFilters && (
            <tr className="filter-row">
              <th className="selection-cell"></th>
              <th className="expansion-cell"></th>
              {props.columns.map(column => (
                <th key={`filter-${column.field}`}>
                  <input
                    type="text"
                    placeholder={`Filter ${column.header}`}
                    value={filterValues[column.field] || ''}
                    onChange={(e) => applyFilter(column.field, e.target.value)}
                  />
                </th>
              ))}
            </tr>
          )}
        </thead>
        
        <tbody>
          {displayData.length === 0 ? (
            <tr>
              <td colSpan={props.columns.length + 2} className="no-data">
                No data to display
              </td>
            </tr>
          ) : (
            displayData.map(row => (
              <>
                <tr
                  key={row.id}
                  ref={el => rowRefs.current[row.id] = el}
                  className={selectedRows.includes(row.id) ? 'selected' : ''}
                >
                  <td className="selection-cell">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleRowSelect(row.id)}
                    />
                  </td>
                  <td className="expansion-cell">
                    <button onClick={() => handleRowExpand(row.id)}>
                      {expandedRows.includes(row.id) ? '▼' : '►'}
                    </button>
                  </td>
                  {props.columns.map(column => (
                    <td key={`${row.id}-${column.field}`}>
                      {column.render ? column.render(row) : row[column.field]}
                    </td>
                  ))}
                </tr>
                {expandedRows.includes(row.id) && (
                  <tr className="expanded-row">
                    <td colSpan={props.columns.length + 2}>
                      {props.expandedRowRender(row)}
                    </td>
                  </tr>
                )}
              </>
            ))
          )}
        </tbody>
      </table>
      
      <div className="data-grid-pagination">
        <button 
          onClick={() => changePage(1)} 
          disabled={page === 1}
        >
          First
        </button>
        <button 
          onClick={() => changePage(page - 1)} 
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages} 
          ({processedData.current.length} total rows)
        </span>
        <button 
          onClick={() => changePage(page + 1)} 
          disabled={page === totalPages}
        >
          Next
        </button>
        <button 
          onClick={() => changePage(totalPages)} 
          disabled={page === totalPages}
        >
          Last
        </button>
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(1); // Reset to first page when changing rows per page
          }}
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>
    </div>
  );
});

// Using the DataGrid
function DataGridExample() {
  const gridRef = useRef(null);
  const [data, setData] = useState([
    // Sample data...
    { id: 1, name: 'John Doe', age: 30, email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com', status: 'Inactive' },
    // More rows...
  ]);
  
  const columns = [
    { field: 'name', header: 'Name' },
    { field: 'age', header: 'Age' },
    { field: 'email', header: 'Email' },
    { 
      field: 'status', 
      header: 'Status',
      render: (row) => (
        <span className={`status-${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      )
    }
  ];
  
  const expandedRowRender = (row) => (
    <div className="expanded-content">
      <h3>Details for {row.name}</h3>
      <p>Additional information could go here...</p>
    </div>
  );
  
  const handleSelectActive = () => {
    // Find all active users and select them
    const activeUserIds = data
      .filter(user => user.status === 'Active')
      .map(user => user.id);
      
    // Clear previous selection first
    gridRef.current.clearSelection();
    
    // Select each active user
    activeUserIds.forEach(id => {
      gridRef.current.selectRow(id);
    });
  };
  
  const handleFocusUser = (id) => {
    gridRef.current.focusCell(id, 'name');
    gridRef.current.expandRow(id);
  };
  
  const handleExport = () => {
    gridRef.current.exportToCSV();
  };
  
  return (
    <div className="data-grid-example">
      <h1>User Management</h1>
      
      <div className="grid-actions">
        <button onClick={handleSelectActive}>Select Active Users</button>
        <button onClick={() => handleFocusUser(2)}>Focus Jane Smith</button>
        <button onClick={handleExport}>Export to CSV</button>
        <button onClick={() => gridRef.current.sortBy('age', 'desc')}>
          Sort by Age (Desc)
        </button>
        <button onClick={() => gridRef.current.focusSearch()}>
          Focus Search
        </button>
      </div>
      
      <DataGrid
        ref={gridRef}
        data={data}
        columns={columns}
        showColumnFilters={true}
        defaultSortField="name"
        defaultSortDirection="asc"
        defaultPage={1}
        defaultRowsPerPage={10}
        expandedRowRender={expandedRowRender}
      />
    </div>
  );
}
```

This comprehensive example demonstrates:

1. A complex component with extensive internal state and logic
2. Dozens of imperative methods exposed to the parent component
3. Proper organization of methods by functionality (data access, navigation, selection, etc.)
4. Integration of multiple ref systems (grid, headers, rows, search input)
5. Appropriate dependency tracking in the imperative handle
6. Parent component consuming the imperative API effectively

This pattern is excellent for complex UI components that require rich programmatic control.

## 11. useImperativeHandle in the Modern React Ecosystem

### React Server Components and useImperativeHandle

In the context of React Server Components (RSC), useImperativeHandle has specific considerations:

```javascript
// Server Component - doesn't use hooks at all
async function UserDashboard({ userId }) {
  // Data fetching happens on the server
  const user = await fetchUserData(userId);
  
  return (
    <div>
      <h1>Dashboard for {user.name}</h1>
      {/* Client components can use useImperativeHandle */}
      <ClientUserProfile user={user} />
    </div>
  );
}

// Client Component - can use hooks including useImperativeHandle
"use client";
const ClientUserProfile = forwardRef((props, ref) => {
  const { user } = props;
  const formRef = useRef(null);
  
  // useImperativeHandle works as usual in client components
  useImperativeHandle(ref, () => ({
    saveProfile: async () => {
      // Save profile implementation
    },
    resetForm: () => {
      // Reset form implementation
    }
  }), []);
  
  return <UserProfileForm ref={formRef} user={user} />;
});
```

With RSC:
- Server Components don't use hooks at all - no useImperativeHandle
- Client Components can use useImperativeHandle for imperative APIs
- The boundary between Server and Client Components is an important architectural consideration

### Integration with React Concurrent Features

When using Suspense and other concurrent features, imperative handles remain useful:

```javascript
const AsyncDataComponent = forwardRef((props, ref) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null);
  
  // Load data function
  const loadData = useCallback(async () => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    try {
      const result = await fetchData(props.dataId, abortControllerRef.current.signal);
      setData(result);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading data:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [props.dataId]);
  
  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    reload: loadData,
    
    cancelLoading: () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setIsLoading(false);
      }
    },
    
    // Suspense-friendly data access
    getDataWithSuspense: () => {
      if (data) {
        return data;
      }
      
      // If no data and not loading, start loading
      if (!isLoading) {
        loadData();
      }
      
      // Throw promise to trigger Suspense
      throw new Promise((resolve) => {
        const checkData = () => {
          if (data) {
            resolve();
          } else {
            setTimeout(checkData, 100);
          }
        };
        checkData();
      });
    }
  }), [data, isLoading, loadData]);
  
  // Load data on mount
  useEffect(() => {
    loadData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);
  
  if (isLoading && !data) {
    return <div>Loading...</div>;
  }
  
  if (!data) {
    return <div>No data available</div>;
  }
  
  return <div>{/* Render data */}</div>;
});

// Using the component with Suspense
function ParentWithSuspense() {
  const dataRef = useRef(null);
  
  return (
    <div>
      <button onClick={() => dataRef.current.reload()}>
        Reload Data
      </button>
      
      <Suspense fallback={<div>Loading in Suspense...</div>}>
        <SuspenseConsumer dataRef={dataRef} />
      </Suspense>
    </div>
  );
}

// Component that uses the imperative suspense method
function SuspenseConsumer({ dataRef }) {
  // This will suspend if data isn't ready
  const data = dataRef.current.getDataWithSuspense();
  
  return <div>{/* Render data */}</div>;
}
```

This approach uses useImperativeHandle to create integration points with React's concurrent features, allowing imperative control of otherwise declarative patterns.

## 12. Testing Components with useImperativeHandle

Testing components that use useImperativeHandle requires specific techniques:

```javascript
// Component to test
const Counter = forwardRef((props, ref) => {
  const [count, setCount] = useState(0);
  
  useImperativeHandle(ref, () => ({
    increment: () => setCount(prev => prev + 1),
    decrement: () => setCount(prev => Math.max(0, prev - 1)),
    reset: () => setCount(0),
    getCount: () => count
  }), [count]);
  
  return <div data-testid="counter">{count}</div>;
});

// Test with React Testing Library
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('exposes imperative methods through ref', () => {
  // Setup: create a ref and render the component with it
  const ref = { current: null };
  render(<Counter ref={ref} />);
  
  // Initial state
  expect(screen.getByTestId('counter')).toHaveTextContent('0');
  
  // Test imperative methods
  act(() => {
    ref.current.increment();
  });
  expect(screen.getByTestId('counter')).toHaveTextContent('1');
  
  act(() => {
    ref.current.increment();
  });
  expect(screen.getByTestId('counter')).toHaveTextContent('2');
  
  act(() => {
    ref.current.decrement();
  });
  expect(screen.getByTestId('counter')).toHaveTextContent('1');
  
  // Test getCount
  expect(ref.current.getCount()).toBe(1);
  
  // Test reset
  act(() => {
    ref.current.reset();
  });
  expect(screen.getByTestId('counter')).toHaveTextContent('0');
});

test('dependency array updates exposed methods', () => {
  // This test verifies that the methods update when dependencies change
  const ref = { current: null };
  const { rerender } = render(<Counter ref={ref} />);
  
  // Use increment to change the count
  act(() => {
    ref.current.increment();
  });
  
  // Store the current reference to getCount
  const originalGetCount = ref.current.getCount;
  
  // Force a rerender of the component
  rerender(<Counter ref={ref} />);
  
  // The getCount method should be a new function since count changed
  expect(ref.current.getCount).not.toBe(originalGetCount);
  
  // But it should still return the correct value
  expect(ref.current.getCount()).toBe(1);
});
```

Key testing techniques:
- Use the `act` function when calling imperative methods
- Create a ref object and pass it to the component
- Test each exposed method for correct behavior
- Verify that dependencies properly update the methods
- Test integration with parent components

## 13. TypeScript Integration with useImperativeHandle

TypeScript adds strong typing to useImperativeHandle, ensuring better type safety:

```typescript
import { ForwardedRef, forwardRef, useImperativeHandle, useRef, useState } from 'react';

// Define the interface for the imperative handle
export interface TextInputHandle {
  focus: () => void;
  clear: () => void;
  setValue: (value: string) => void;
  getValue: () => string;
}

// Define props interface
interface TextInputProps {
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

// Create the component with proper typing
const TextInput = forwardRef<TextInputHandle, TextInputProps>((props, ref) => {
  const [value, setValue] = useState(props.defaultValue || '');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (props.onChange) {
      props.onChange(newValue);
    }
  };
  
  // Type-safe imperative handle
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      clear: () => {
        setValue('');
        inputRef.current?.focus();
      },
      setValue: (newValue: string) => {
        setValue(newValue);
      },
      getValue: () => value
    }),
    [value]
  );
  
  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={props.placeholder}
    />
  );
});

// Using the typed component
function TypedFormExample() {
  // TypeScript knows exactly what methods are available on this ref
  const inputRef = useRef<TextInputHandle>(null);
  
  const handleGetValue = () => {
    // TypeScript guarantees these methods exist and are type-safe
    if (inputRef.current) {
      alert(`Current value: ${inputRef.current.getValue()}`);
    }
  };
  
  return (
    <div>
      <TextInput
        ref={inputRef}
        defaultValue="Hello, TypeScript!"
        placeholder="Type something..."
      />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
      <button onClick={() => inputRef.current?.clear()}>Clear</button>
      <button onClick={handleGetValue}>Get Value</button>
    </div>
  );
}
```

TypeScript provides several benefits with useImperativeHandle:
1. Explicit interface for what methods and properties are exposed
2. Compile-time checking for the consumer of the imperative handle
3. Proper type information for method parameters and return values
4. Auto-completion support in code editors

## 14. Performance Considerations with useImperativeHandle

useImperativeHandle can impact performance if not used carefully:

```javascript
const PotentiallySlowComponent = forwardRef((props, ref) => {
  // State and refs...
  
  // 🔴 Performance concern: Complex object recreation on every render
  useImperativeHandle(ref, () => {
    // Calculate expensive properties for the handle
    const expensiveComputation = calculateExpensiveValue();
    
    return {
      doSomething: () => {
        // Implementation...
      },
      complexProperty: expensiveComputation
    };
  }); // Missing dependency array!
  
  return <div>{/* Component content */}</div>;
});
```

To optimize performance:

```javascript
const OptimizedComponent = forwardRef((props, ref) => {
  // State and refs...
  const [value, setValue] = useState(0);
  
  // Pre-compute expensive values
  const expensiveComputation = useMemo(() => {
    return calculateExpensiveValue();
  }, [/* relevant dependencies */]);
  
  // ✅ Performance optimization: Clear dependencies and memoization
  useImperativeHandle(
    ref,
    () => ({
      doSomething: () => {
        // Implementation...
      },
      getValue: () => value,
      complexProperty: expensiveComputation
    }),
    [value, expensiveComputation]
  );
  
  return <div>{/* Component content */}</div>;
});
```

Best practices for performance:
1. Always include a dependency array
2. Use useMemo for expensive calculations referenced in the handle
3. Only include necessary methods and properties
4. Keep imperative handle objects small and focused
5. Be mindful of dependencies that change frequently

## 15. Conclusion: Mental Models for useImperativeHandle

To master useImperativeHandle, keep these mental models in mind:

### 1. Custom API Designer

Think of useImperativeHandle as designing a custom API for your component:

```javascript
// Mental model: "I'm creating a public API for my component"
useImperativeHandle(ref, () => ({
  // Only expose what others should use
  publicMethod1: () => { /* implementation */ },
  publicMethod2: () => { /* implementation */ },
  publicProperty: value
}), [value]);
```

Just as with a good public API:
- Expose only what's necessary
- Keep implementation details hidden
- Maintain backward compatibility
- Document the interface clearly

### 2. Controlled Bridge Between Paradigms

View useImperativeHandle as a controlled bridge between React's declarative world and imperative needs:

```javascript
// Mental model: "This is a controlled bridge between declarative and imperative code"
useImperativeHandle(ref, () => ({
  // Transform imperative calls into declarative state updates
  doSomething: () => {
    // Instead of direct DOM manipulation, update state
    setState(newValue);
  }
}), [setState]);
```

This lets you maintain React's declarative approach while exposing imperative methods when needed.

### 3. Adapter Pattern Implementation

Think of useImperativeHandle as implementing the Adapter pattern from software design:

```javascript
// Mental model: "I'm adapting internal implementations to an external interface"
useImperativeHandle(ref, () => {
  // Internal implementation may be complex
  const internalFormat = /* ... */;
  
  // Expose a simplified interface
  return {
    simpleMethod: () => {
      // Adapt the complex internal implementation
      complexInternalFunction(internalFormat);
    }
  };
}, [internalFormat]);
```

This creates a layer that translates between your component's internal structure and what parent components need.

### 4. Decision Tree for Using useImperativeHandle

When deciding whether to use useImperativeHandle, consider:

1. Is the functionality naturally imperative?
   - Focus management, media playback, animations, etc. → Yes
   - Data display, rendering patterns → Probably not

2. Does the parent need programmatic control?
   - Parent needs to trigger actions at specific times → Yes
   - Parent only needs to configure the component → No, use props

3. Is the component's API surface complex?
   - Exposing many methods with complex parameters → Yes, for API control
   - Simple toggling or triggering → Consider a simpler approach first

4. Would exposing the entire DOM element or component be problematic?
   - Exposing too much implementation detail → Yes, use useImperativeHandle
   - Simple case with a single DOM element → forwardRef alone may be sufficient

Understanding these mental models will help you apply useImperativeHandle effectively in your React applications. Remember that while it's a powerful tool, it should be used judiciously, primarily for cases where imperative control is truly necessary and can't be achieved through props and state.