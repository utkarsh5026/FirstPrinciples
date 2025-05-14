# Page Transitions with AnimatePresence in React Framer Motion

I'll explain page transitions using AnimatePresence in Framer Motion from first principles, breaking down each concept step by step with examples.

## Understanding Animation in Web Development

> "Animation is not just about making things move. It's about guiding the user's attention and creating a sense of continuity between states."

Before diving into Framer Motion's AnimatePresence, let's understand why animations matter for page transitions. In traditional websites, navigating between pages causes abrupt changes - the current page disappears and the new one appears instantly. This creates a jarring experience that breaks user flow.

Animation helps bridge this gap by creating visual continuity. It helps users understand:

* Where they're coming from
* Where they're going
* The relationship between different parts of your application

## The Foundation: React's Component Lifecycle

React applications work by mounting and unmounting components. When a user navigates to a new page:

1. The current page component unmounts (disappears)
2. The new page component mounts (appears)

By default, React doesn't provide animation capabilities during this process. When a component is removed from the DOM, it's gone immediately - there's no opportunity to animate its exit.

## Enter Framer Motion

Framer Motion is a motion library for React that makes creating animations simple. It provides components and hooks to animate React components with minimal code.

> "Framer Motion abstracts away the complexity of CSS transitions, keyframes, and JavaScript-based animations, giving you a declarative API that feels natural in React."

### Key Concepts in Framer Motion

Before understanding AnimatePresence, let's cover some basic Framer Motion concepts:

1. **The `motion` component** : This is the building block of Framer Motion. It extends HTML and SVG elements with animation capabilities.
2. **Animation properties** : Framer Motion uses props like `initial`, `animate`, and `exit` to define states.
3. **Variants** : These are named animation targets that help organize complex animations.

Let's see a simple example of a motion component:

```jsx
import { motion } from 'framer-motion';

function FadeInBox() {
  return (
    <motion.div
      initial={{ opacity: 0 }} // Starting state
      animate={{ opacity: 1 }} // End state
      transition={{ duration: 0.5 }} // How long the animation takes
    >
      Hello, world!
    </motion.div>
  );
}
```

In this example:

* We import the `motion` component from Framer Motion
* We create a motion div with an initial opacity of 0 (invisible)
* We animate it to an opacity of 1 (visible)
* The transition takes 0.5 seconds

## The Problem: Animating Component Exits

The animation above works great for components entering the DOM, but what about when they leave? When React removes a component from the DOM, it's gone immediately - there's no chance to animate its departure.

This is where AnimatePresence comes in.

## Understanding AnimatePresence

> "AnimatePresence allows components to animate out when they're removed from the React tree."

AnimatePresence is a component that detects when elements are being removed from the React tree and enables exit animations before the actual removal.

Here's what makes AnimatePresence special:

1. It **detects when components mount and unmount**
2. It **delays the removal** of components from the DOM until exit animations complete
3. It **works with conditional rendering** to animate components in and out

## How AnimatePresence Works

Conceptually, AnimatePresence follows these steps:

1. Watches its children to detect when a component with an `exit` property is about to be removed
2. When removal is detected, it intercepts the process
3. It triggers the exit animation defined by the `exit` property
4. After the animation completes, it allows React to actually remove the component

Let's see a simple example:

```jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

function ToggleBox() {
  const [isVisible, setIsVisible] = useState(true);
  
  return (
    <div>
      <button onClick={() => setIsVisible(!isVisible)}>
        Toggle
      </button>
    
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              background: 'blue', 
              width: 100, 
              height: 100,
              margin: '20px 0'
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

In this example:

* We have a blue box that can be toggled on and off
* When it appears, it fades in (opacity 0 → 1)
* When it disappears, it fades out (opacity 1 → 0)
* AnimatePresence ensures the exit animation plays before the component is removed

## The Key Prop in AnimatePresence

When animating between multiple components, AnimatePresence needs a way to track which component is which. This is done using the `key` prop:

```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentPage}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {/* Page content */}
  </motion.div>
</AnimatePresence>
```

The `key` prop tells AnimatePresence when a component has been replaced so it knows to trigger exit animations. The `mode="wait"` prop makes AnimatePresence wait for the exiting component to finish its animation before mounting the new one.

## Building a Page Transition System

Now let's put everything together to create a page transition system in React. We'll create a simple multi-page application with animated transitions.

### Step 1: Setting Up the Router

First, we need a router. For this example, I'll use React Router:

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}
```

This sets up a basic router, but there's no animation yet. We need to modify it to use AnimatePresence.

### Step 2: Adding AnimatePresence

React Router v6 handles routes differently than previous versions. To use AnimatePresence, we need to create a layout component:

```jsx
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

function AnimatedRoutes({ children }) {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      {React.cloneElement(children, { key: location.pathname })}
    </AnimatePresence>
  );
}
```

Then modify our App component:

```jsx
function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    
      <AnimatedRoutes>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </AnimatedRoutes>
    </BrowserRouter>
  );
}
```

### Step 3: Creating Animated Page Components

Now we need to make our page components use motion:

```jsx
// Home.jsx
import { motion } from 'framer-motion';

function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
    >
      <h1>Home Page</h1>
      <p>Welcome to our website!</p>
    </motion.div>
  );
}
```

The other pages would follow the same pattern, perhaps with different animation directions.

However, rather than repeating the same animation code in each component, let's create a reusable page wrapper:

```jsx
// PageTransition.jsx
import { motion } from 'framer-motion';

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

Then our pages become much simpler:

```jsx
// Home.jsx
import PageTransition from '../components/PageTransition';

function Home() {
  return (
    <PageTransition>
      <h1>Home Page</h1>
      <p>Welcome to our website!</p>
    </PageTransition>
  );
}
```

## Advanced AnimatePresence Techniques

### Using Variants for Complex Animations

Variants make it easier to coordinate animations across multiple elements:

```jsx
// Define variants outside the component to avoid recreation on render
const pageVariants = {
  hidden: { opacity: 0, x: -200 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5 }
  },
  exit: { 
    opacity: 0, 
    x: 200,
    transition: { duration: 0.5 }
  }
};

function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
```

This approach makes it easy to modify the entire animation by changing one object.

### Staggered Animations with Children

You can create staggered animations where child elements animate in sequence:

```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1 // Delay between each child
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1 // Reverse order for exit
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 }
};

function StaggeredPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.h1 variants={itemVariants}>Title</motion.h1>
      <motion.p variants={itemVariants}>First paragraph</motion.p>
      <motion.p variants={itemVariants}>Second paragraph</motion.p>
    </motion.div>
  );
}
```

In this example:

* The container has variants for orchestrating the overall animation
* Each child element inherits the animation state from its parent
* Children animate in sequence rather than all at once
* When exiting, they animate in reverse order

## A Complete Page Transition Example

Let's put everything together in a more complete example:

```jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define our animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: '-100vw',
    scale: 0.8
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: '100vw',
    scale: 1.2
  }
};

// Add transition options
const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

// Create our app component
function App() {
  const [page, setPage] = useState('home');
  
  // Content for each page
  const pageContent = {
    home: (
      <div>
        <h1>Home Page</h1>
        <p>Welcome to the home page!</p>
      </div>
    ),
    about: (
      <div>
        <h1>About Us</h1>
        <p>Learn more about our company.</p>
      </div>
    ),
    contact: (
      <div>
        <h1>Contact Us</h1>
        <p>Reach out to our team.</p>
      </div>
    )
  };
  
  return (
    <div className="app">
      <nav>
        <button onClick={() => setPage('home')}>Home</button>
        <button onClick={() => setPage('about')}>About</button>
        <button onClick={() => setPage('contact')}>Contact</button>
      </nav>
    
      <div className="page-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="page"
          >
            {pageContent[page]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
```

In this example:

* We use a state variable to track the current page
* We define animation variants and transitions
* We use AnimatePresence with `mode="wait"` to ensure clean transitions
* When the page state changes, AnimatePresence detects this and:
  1. Plays the exit animation for the current page
  2. Waits for it to finish
  3. Renders the new page with its entrance animation

## Common Challenges and Solutions

### 1. Handling Routes with Parameters

When using React Router with dynamic routes, be sure to use the full pathname as the key:

```jsx
const location = useLocation();

<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    {/* Routes go here */}
  </Routes>
</AnimatePresence>
```

### 2. Scroll Position

Page transitions often need to reset the scroll position. Use `useEffect`:

```jsx
useEffect(() => {
  window.scrollTo(0, 0);
}, [pathname]);
```

### 3. Nested Animations

When you have nested AnimatePresence components, use different modes:

```jsx
<AnimatePresence mode="wait">
  <motion.div key={page}>
    {/* Page content */}
  
    <AnimatePresence mode="sync">
      {/* Nested animated elements */}
    </AnimatePresence>
  </motion.div>
</AnimatePresence>
```

## Performance Considerations

Animations can impact performance. Here are some tips:

> "Always animate properties that are cheap for the browser to animate. Stick to `transform` and `opacity` whenever possible."

1. Use the `layoutId` prop for elements that change position rather than animating position directly
2. Set `willChange: 'transform, opacity'` for elements that will animate frequently
3. Use the `LayoutGroup` component to coordinate layout animations across components

## Conclusion

AnimatePresence in Framer Motion provides a powerful way to create smooth, professional page transitions in React applications. By understanding:

1. How React's component lifecycle works
2. How AnimatePresence intercepts component removal
3. How to use variants for coordinated animations
4. How to structure your components for clean transitions

You can create intuitive interfaces that guide users through your application with fluid, meaningful animations.

Remember that good animation isn't just decorative - it provides visual cues that help users understand the relationship between different parts of your application and create a sense of place and direction.

Would you like me to elaborate on any specific aspect of page transitions with AnimatePresence?
