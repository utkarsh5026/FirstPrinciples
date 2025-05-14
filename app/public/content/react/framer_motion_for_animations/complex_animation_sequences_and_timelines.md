# Understanding Complex Animation Sequences and Timelines in Framer Motion

Framer Motion is a powerful animation library for React that allows developers to create fluid, natural animations with minimal code. To fully understand complex animation sequences and timelines, we need to start from the absolute fundamentals and build our knowledge systematically.

## 1. First Principles of Animation

> Animation, at its core, is the illusion of movement created by displaying a sequence of static images or states in rapid succession. Our brains perceive this sequence as continuous motion when the transitions between states are smooth enough.

In the digital world, animation happens when we change an element's properties (like position, size, or opacity) gradually over time rather than instantly. This gradual change creates the perception of natural movement.

### The Physics of Animation

Real-world movement follows physical laws. Objects don't start or stop instantly—they accelerate and decelerate. Good animations mimic these natural behaviors:

1. **Ease-in** : Objects start slowly and accelerate
2. **Ease-out** : Objects decelerate before stopping
3. **Ease-in-out** : A combination where objects both accelerate at the start and decelerate at the end

## 2. Introduction to Framer Motion

Framer Motion is built on these principles, offering a declarative API that handles the complex calculations needed for natural-looking animations.

### Core Concepts

* **`motion` components** : Enhanced React components that can be animated
* **Variants** : Predefined animation states that elements can transition between
* **Transitions** : Specifications for how animations should progress
* **Gestures** : User interactions that can trigger animations
* **AnimatePresence** : A component that enables exit animations for elements being removed from the DOM

Let's start with a basic example of animating a box:

```jsx
import { motion } from "framer-motion";

function AnimatedBox() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: 100,
        height: 100,
        backgroundColor: "blue"
      }}
    />
  );
}
```

This code creates a blue box that animates from being invisible and 100 pixels to the left to being fully visible at its normal position. The animation takes 0.5 seconds.

Here's what's happening:

* We import the `motion` component from framer-motion
* We create a `motion.div` with initial properties (starting state)
* We define the target state in the `animate` prop
* We specify how the transition should occur in the `transition` prop

## 3. Understanding Transitions in Depth

Transitions define how animations behave over time. Let's explore the properties that control this behavior:

```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    duration: 0.8,
    ease: "easeInOut",
    delay: 0.2,
  }}
  style={{ width: 100, height: 100, backgroundColor: "purple" }}
/>
```

In this example:

* `duration`: Controls how long the animation takes (in seconds)
* `ease`: Defines the acceleration curve (how the animation speeds up and slows down)
* `delay`: Makes the animation wait before starting

> Understanding the `ease` property is crucial for natural animations. Different easing functions create different feelings of movement, from mechanical to organic.

Common easing functions include:

* "linear": Constant speed (mechanical feeling)
* "easeIn": Starts slow, ends fast
* "easeOut": Starts fast, ends slow
* "easeInOut": Starts and ends slow, speeds up in the middle
* Custom curves like [0.42, 0, 0.58, 1] (cubic-bezier values)

## 4. Animation Sequences: Doing One Thing After Another

Animation sequences allow you to chain animations, with each one starting after the previous one finishes. There are several ways to create sequences in Framer Motion.

### Method 1: Using Variants with `staggerChildren`

```jsx
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Delay between each child starting
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

function SequentialList() {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ listStyle: "none" }}
    >
      {[1, 2, 3, 4].map(index => (
        <motion.li
          key={index}
          variants={itemVariants}
          style={{
            padding: "10px",
            marginBottom: "10px",
            backgroundColor: "lightblue"
          }}
        >
          Item {index}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

This example shows a list where each item appears sequentially:

* We define variants for both the container and individual items
* The container's `staggerChildren` property creates a delay between each child's animation
* Each child automatically inherits the `hidden` and `visible` states from its parent
* Children animate in sequence rather than all at once

### Method 2: Using `AnimateSharedLayout` and layout animations

```jsx
import { motion, AnimateSharedLayout } from "framer-motion";
import { useState } from "react";

function ExpandableCards() {
  const [selectedId, setSelectedId] = useState(null);
  
  return (
    <AnimateSharedLayout>
      <ul style={{ display: "flex", listStyle: "none" }}>
        {[1, 2, 3].map(id => (
          <motion.li
            key={id}
            layoutId={`card-${id}`}
            onClick={() => setSelectedId(id === selectedId ? null : id)}
            style={{
              borderRadius: 10,
              backgroundColor: "coral",
              margin: 10,
              padding: selectedId === id ? 40 : 20,
              cursor: "pointer"
            }}
            transition={{ duration: 0.5 }}
          >
            Card {id}
          </motion.li>
        ))}
      </ul>
    </AnimateSharedLayout>
  );
}
```

In this example:

* We create cards that expand when clicked
* The `layoutId` enables Framer Motion to transition smoothly between states
* When a card is clicked, it expands while others may contract
* The animations happen automatically based on layout changes

## 5. Understanding Timelines: Orchestrating Complex Animations

> A timeline is a powerful way to coordinate multiple animations with precise control over their timing relationships.

In Framer Motion, complex timelines can be created using a combination of the `transition` property with careful orchestration.

### Creating Timelines with `when` and `delayChildren`

```jsx
import { motion } from "framer-motion";

const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.2,
      staggerDirection: -1, // Reverse direction for when closing
      when: "afterChildren", // Only animate container after all children are done
    },
  },
};

const loadingCircleVariants = {
  start: {
    y: "0%",
  },
  end: {
    y: "100%",
  },
};

const loadingCircleTransition = {
  duration: 0.5,
  yoyo: Infinity, // Makes the animation repeat back and forth
  ease: "easeInOut",
};

function LoadingAnimation() {
  return (
    <motion.div
      style={{
        width: 150,
        height: 100,
        display: "flex",
        justifyContent: "space-around",
      }}
      variants={loadingContainerVariants}
      initial="start"
      animate="end"
    >
      {[1, 2, 3].map(index => (
        <motion.span
          key={index}
          style={{
            display: "block",
            width: 20,
            height: 20,
            backgroundColor: "teal",
            borderRadius: "50%",
          }}
          variants={loadingCircleVariants}
          transition={loadingCircleTransition}
        />
      ))}
    </motion.div>
  );
}
```

This example creates a loading animation where three circles bounce up and down in sequence:

* The container orchestrates the timing with `staggerChildren`
* Each circle animates according to the circle variants
* The `yoyo: Infinity` makes the animation repeat continuously
* `when: "afterChildren"` ensures timing dependencies are maintained

### Using the `transition.times` Array for Precise Timeline Control

For even more precise control, we can use the `times` array to define exactly when properties should be at specific values:

```jsx
import { motion } from "framer-motion";

function ComplexPathAnimation() {
  return (
    <motion.div
      style={{
        width: 50,
        height: 50,
        backgroundColor: "orangered",
        borderRadius: 10,
      }}
      animate={{
        x: [0, 100, 100, 0, 0],
        y: [0, 0, 100, 100, 0],
        rotate: [0, 0, 180, 180, 0],
      }}
      transition={{
        duration: 4,
        times: [0, 0.25, 0.5, 0.75, 1], // These correspond to the array positions above
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 1,
      }}
    />
  );
}
```

In this example:

* The box follows a square path while rotating
* The `times` array specifies exactly when each keyframe should be reached
* The animation repeats infinitely with a 1-second pause between cycles
* The movement is proportionally timed (25% of duration for each side of the square)

## 6. Advanced Timeline Control with Orchestration

For the most complex animations, we need to orchestrate multiple elements with precise timing. This is where Framer Motion really shines.

### Creating an Advanced Multi-Element Timeline

```jsx
import { motion } from "framer-motion";
import { useState } from "react";

function AdvancedTimeline() {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren", // Start before children animations
        staggerChildren: 0.3,
        delayChildren: 0.5, // Wait half a second before starting children
      }
    },
    exit: {
      opacity: 0,
      transition: {
        when: "afterChildren", // Wait for children to finish before exiting
        staggerChildren: 0.2,
        staggerDirection: -1, // Reverse stagger direction (last in, first out)
      }
    }
  };
  
  const childVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: (custom) => ({
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        damping: 10,
        stiffness: 100,
        delay: custom * 0.2 // Custom delay based on index
      }
    }),
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <div>
      <button 
        onClick={() => setIsAnimating(!isAnimating)}
        style={{ marginBottom: 20 }}
      >
        {isAnimating ? "Reset" : "Animate"}
      </button>
    
      {isAnimating && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            padding: 20,
            backgroundColor: "#f0f0f0",
            borderRadius: 10
          }}
        >
          {[1, 2, 3, 4].map((index) => (
            <motion.div
              key={index}
              custom={index} // Pass index as custom prop for staggering
              variants={childVariants}
              style={{
                marginBottom: 10,
                padding: 15,
                backgroundColor: `hsl(${index * 60}, 80%, 60%)`,
                borderRadius: 5
              }}
            >
              Item {index}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
```

This example demonstrates several advanced concepts:

* Container and children with precisely coordinated animations
* Using `custom` props to create custom delays based on item index
* Spring physics for more natural motion
* Exit animations coordinated with enter animations
* Reversing the stagger direction for exit

> The power of Framer Motion timelines comes from combining variants, transition properties, and state management to create precisely synchronized animation patterns.

## 7. Orchestrating Simultaneous and Sequential Animations

For even more complex scenarios, we may want some animations to happen simultaneously and others sequentially. Framer Motion handles this through careful use of transition properties.

```jsx
import { motion } from "framer-motion";

function OrchestrationExample() {
  const cardVariants = {
    offscreen: {
      y: 300,
      opacity: 0
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
        // These next animations happen AFTER the card arrives
        delayChildren: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const contentVariants = {
    offscreen: {
      opacity: 0,
      y: 20
    },
    onscreen: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  // These happen in parallel with the card arrival
  const backgroundVariants = {
    offscreen: {
      opacity: 0
    },
    onscreen: {
      opacity: 1,
      transition: { duration: 1.5 }
    }
  };

  return (
    <div style={{ overflow: "hidden", position: "relative", height: 300 }}>
      <motion.div
        variants={backgroundVariants}
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.8 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#f0f8ff"
        }}
      />
    
      <motion.div
        className="card"
        variants={cardVariants}
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.8 }}
        style={{
          margin: 20,
          padding: 30,
          backgroundColor: "white",
          borderRadius: 12,
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          position: "relative",
          zIndex: 1
        }}
      >
        <motion.h2 variants={contentVariants}>
          Card Title
        </motion.h2>
        <motion.p variants={contentVariants}>
          This content animates in after the card arrives.
        </motion.p>
        <motion.button 
          variants={contentVariants}
          style={{
            marginTop: 15,
            padding: "8px 15px",
            border: "none",
            borderRadius: 4,
            backgroundColor: "royalblue",
            color: "white"
          }}
        >
          Learn More
        </motion.button>
      </motion.div>
    </div>
  );
}
```

In this example:

* The background and card animate simultaneously when the component enters the viewport
* After the card arrives, the content elements (title, text, button) animate in sequence
* This creates a complex orchestrated timeline with both parallel and sequential animations
* The `whileInView` property triggers animations when the component becomes visible in the viewport

## 8. Using Dynamic Animations in Timelines

Real-world applications often need animations that respond to user input or data. Let's create a timeline that changes based on dynamic values:

```jsx
import { motion, useAnimationControls } from "framer-motion";
import { useState, useEffect } from "react";

function DynamicTimeline() {
  const [progress, setProgress] = useState(0);
  const controls = useAnimationControls();
  
  // Update animation when progress changes
  useEffect(() => {
    controls.start({
      width: `${progress}%`,
      transition: { duration: 0.8, ease: "easeOut" }
    });
  }, [progress, controls]);
  
  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(parseInt(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>
    
      <div 
        style={{ 
          backgroundColor: "#f0f0f0",
          height: 20,
          borderRadius: 10,
          overflow: "hidden"
        }}
      >
        <motion.div
          animate={controls}
          style={{
            height: "100%",
            backgroundColor: `hsl(${progress * 1.2}, 80%, 60%)`,
            borderRadius: 10
          }}
        />
      </div>
    
      <motion.div
        animate={{
          y: [0, -10, 0],
          opacity: progress === 100 ? 1 : 0,
          scale: progress === 100 ? [1, 1.2, 1] : 1
        }}
        transition={{
          duration: 0.5,
          times: [0, 0.5, 1],
          repeat: progress === 100 ? 2 : 0
        }}
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: "green",
          color: "white",
          borderRadius: 5,
          textAlign: "center"
        }}
      >
        {progress === 100 ? "Complete!" : ""}
      </motion.div>
    </div>
  );
}
```

This example:

* Creates a progress bar that animates as the user adjusts a slider
* Uses `useAnimationControls` to programmatically control animations
* Changes the color of the progress bar dynamically based on the value
* Triggers a celebration animation only when the progress reaches 100%
* Shows how timelines can be responsive to user input

> Using `useAnimationControls` gives you programmatic control over animations, allowing you to start, stop, and modify animations based on any conditions in your application.

## 9. Best Practices for Complex Animation Timelines

When building complex animations, keep these principles in mind:

1. **Group related animations** into variants to keep your code organized
2. **Use descriptive names** for your animation states
3. **Think in terms of states** , not individual property changes
4. **Break complex animations** into smaller, manageable pieces
5. **Use custom properties** to create variations in otherwise similar animations
6. **Test on lower-end devices** to ensure performance
7. **Use the `layout` prop** for animations that respond to layout changes
8. **Leverage gesture animations** for interactive elements

### Performance Optimization Example

```jsx
import { motion } from "framer-motion";

function OptimizedAnimation() {
  return (
    <motion.div
      style={{
        width: 100,
        height: 100,
        backgroundColor: "purple"
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5,
        // Performance optimizations
        translateX: { type: "spring", stiffness: 300 },
        opacity: { duration: 0.2 }
      }}
      // Use transform property for better performance
      transformTemplate={(props, transform) =>
        `translateX(${props.x}px) rotate(${props.rotate}deg) scale(${props.scale})`
      }
    />
  );
}
```

This example:

* Uses different transition properties for different animation aspects
* Explicitly defines a `transformTemplate` for optimized transform performance
* Keeps the animation focused and efficient

## 10. Practical Example: Creating a Multi-Step Form with Animation Timelines

Let's see all these concepts come together in a practical example:

```jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function AnimatedMultiStepForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  
  const nextStep = () => {
    setDirection(1);
    setStep(s => Math.min(s + 1, 3));
  };
  
  const prevStep = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 1));
  };
  
  const formVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };
  
  const stepTitles = {
    1: "Personal Information",
    2: "Contact Details",
    3: "Review and Submit"
  };
  
  return (
    <div style={{ width: 400, margin: "0 auto", overflow: "hidden" }}>
      {/* Progress indicator */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        {[1, 2, 3].map(index => (
          <motion.div
            key={index}
            animate={{
              scale: step === index ? 1.2 : 1,
              backgroundColor: step >= index ? "#4a90e2" : "#d8d8d8"
            }}
            transition={{ duration: 0.3 }}
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              margin: "0 10px",
              cursor: "pointer"
            }}
            onClick={() => {
              setDirection(index > step ? 1 : -1);
              setStep(index);
            }}
          />
        ))}
      </div>
    
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={formVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
          }}
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Step {step}: {stepTitles[step]}
          </motion.h2>
        
          <div style={{ 
            backgroundColor: "#f5f5f5", 
            padding: 20, 
            borderRadius: 10,
            minHeight: 200
          }}>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
              >
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  style={{ marginBottom: 15 }}
                >
                  <label style={{ display: "block", marginBottom: 5 }}>
                    Name
                  </label>
                  <input type="text" style={{ 
                    width: "100%", 
                    padding: 8, 
                    borderRadius: 4,
                    border: "1px solid #ddd"
                  }} />
                </motion.div>
              
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <label style={{ display: "block", marginBottom: 5 }}>
                    Age
                  </label>
                  <input type="number" style={{ 
                    width: "100%", 
                    padding: 8, 
                    borderRadius: 4,
                    border: "1px solid #ddd"
                  }} />
                </motion.div>
              </motion.div>
            )}
          
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
              >
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  style={{ marginBottom: 15 }}
                >
                  <label style={{ display: "block", marginBottom: 5 }}>
                    Email
                  </label>
                  <input type="email" style={{ 
                    width: "100%", 
                    padding: 8, 
                    borderRadius: 4,
                    border: "1px solid #ddd"
                  }} />
                </motion.div>
              
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <label style={{ display: "block", marginBottom: 5 }}>
                    Phone
                  </label>
                  <input type="tel" style={{ 
                    width: "100%", 
                    padding: 8, 
                    borderRadius: 4,
                    border: "1px solid #ddd"
                  }} />
                </motion.div>
              </motion.div>
            )}
          
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ textAlign: "center" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.5
                  }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: "#4caf50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px"
                  }}
                >
                  <span style={{ color: "white", fontSize: 40 }}>✓</span>
                </motion.div>
                <h3>Ready to Submit!</h3>
                <p>Please review your information and click submit.</p>
              </motion.div>
            )}
          </div>
        
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            marginTop: 20
          }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevStep}
              disabled={step === 1}
              style={{
                padding: "10px 20px",
                backgroundColor: step === 1 ? "#ccc" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: step === 1 ? "default" : "pointer"
              }}
            >
              Previous
            </motion.button>
          
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={step === 3 ? () => alert("Form submitted!") : nextStep}
              style={{
                padding: "10px 20px",
                backgroundColor: step === 3 ? "#28a745" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer"
              }}
            >
              {step === 3 ? "Submit" : "Next"}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

This comprehensive example brings together multiple concepts:

1. **Page transitions** with directional awareness
2. **Staggered animations** for form fields
3. **Conditional rendering** with `AnimatePresence`
4. **Timeline orchestration** where some animations depend on others
5. **Gesture animations** for interactive elements like buttons
6. **State-driven animations** where progress indicators reflect the current step
7. **Complex exit animations** that coordinate with entrance animations

## Conclusion

Complex animation sequences and timelines in Framer Motion are built from fundamental principles:

> Animation is about creating the illusion of natural movement by changing properties over time in a way that respects physics and human perception.

By understanding the core concepts—motion components, variants, transitions, and orchestration—you can build animations of any complexity. Remember to:

1. Think in terms of states and transitions between them
2. Use variants to organize related animations
3. Leverage staggering and delays for sequential animations
4. Coordinate parent and child animations for complex timelines
5. Use the appropriate animation physics for different types of movement
6. Consider performance implications, especially for mobile devices

With these principles and techniques, you can create animation sequences and timelines that are not just visually impressive but also enhance the user experience by making interfaces more intuitive, engaging, and delightful.
