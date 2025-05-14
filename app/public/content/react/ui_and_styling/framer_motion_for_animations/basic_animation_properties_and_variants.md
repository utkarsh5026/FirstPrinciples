# Framer Motion: Animation in React from First Principles

I'll explain Framer Motion from the ground up, covering the basic animation properties and variants to give you a comprehensive understanding of how animation works in React using this powerful library.

> Animation is not just about making things move—it's about creating meaningful transitions that guide users through your interface and bring your application to life.

## What is Framer Motion?

Framer Motion is a production-ready animation library for React that makes creating animations surprisingly simple. At its core, it provides a set of React components that make DOM animations declarative, which aligns perfectly with React's philosophy.

### The Fundamental Concept: The `motion` Component

The foundation of Framer Motion is the `motion` component. This is a simple but powerful abstraction that turns any standard HTML or SVG element into an animatable element.

Let's start with the most basic example:

```jsx
import { motion } from "framer-motion";

function BasicAnimation() {
  return (
    <motion.div
      animate={{ x: 100 }}
      transition={{ duration: 2 }}
    >
      I will move 100px to the right
    </motion.div>
  );
}
```

Here's what's happening in this example:

* We import the `motion` component
* We create a `motion.div` (instead of a regular `div`)
* We tell it to animate its x-position to 100px
* We specify a transition that takes 2 seconds

This simple pattern forms the basis of all Framer Motion animations.

## Basic Animation Properties

Let's explore the core properties that drive animations in Framer Motion:

### 1. `initial`

This defines the starting state of your component before any animation begins.

```jsx
import { motion } from "framer-motion";

function FadeInComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      I will fade in!
    </motion.div>
  );
}
```

In this example:

* `initial={{ opacity: 0 }}` — The component starts completely transparent
* `animate={{ opacity: 1 }}` — It animates to full opacity
* `transition={{ duration: 1 }}` — The animation takes 1 second

### 2. `animate`

This is the target state of your animation. Framer Motion will automatically animate between the `initial` and `animate` states.

You can animate multiple properties simultaneously:

```jsx
import { motion } from "framer-motion";

function MultiPropertyAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotate: 360  
      }}
      transition={{ duration: 1.5 }}
      style={{ 
        width: 100, 
        height: 100, 
        backgroundColor: "tomato" 
      }}
    >
    </motion.div>
  );
}
```

This component will:

* Start at 50% size and completely transparent
* Animate to full size and opacity
* Rotate 360 degrees during the animation
* All this happens over 1.5 seconds

### 3. `transition`

This property lets you fine-tune how the animation behaves. It accepts a variety of options:

```jsx
import { motion } from "framer-motion";

function CustomTransition() {
  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 100 }}
      transition={{ 
        duration: 2,
        ease: "easeInOut",
        delay: 0.5,
        repeatType: "reverse",
        repeat: 1
      }}
      style={{ 
        width: 100, 
        height: 50, 
        backgroundColor: "skyblue" 
      }}
    >
      Custom transition
    </motion.div>
  );
}
```

Here's what each transition property does:

* `duration: 2` — Animation lasts 2 seconds
* `ease: "easeInOut"` — Starts slow, speeds up, then slows down at the end
* `delay: 0.5` — Animation starts after a 0.5 second delay
* `repeatType: "reverse"` — After completing, the animation reverses
* `repeat: 1` — The animation plays twice (original + 1 repeat)

### 4. `whileHover` and `whileTap`

These special properties create animations that activate on user interaction:

```jsx
import { motion } from "framer-motion";

function InteractiveButton() {
  return (
    <motion.button
      initial={{ backgroundColor: "#3498db" }}
      whileHover={{ 
        scale: 1.1,
        backgroundColor: "#2980b9"
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        border: "none",
        padding: "10px 20px",
        borderRadius: "4px",
        color: "white",
        cursor: "pointer"
      }}
    >
      Hover and Click Me!
    </motion.button>
  );
}
```

In this example:

* The button starts with a light blue background
* When hovered, it scales up slightly and changes to a darker blue
* When clicked (tapped), it scales down slightly
* All transitions happen over 0.2 seconds for a snappy feel

### 5. `exit`

When removing elements from the DOM, you can define exit animations with this property. However, it requires using the `AnimatePresence` component:

```jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function ExitAnimation() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div>
      <button onClick={() => setIsVisible(!isVisible)}>
        Toggle Element
      </button>
    
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            style={{ 
              marginTop: 20,
              padding: 20, 
              backgroundColor: "purple",
              color: "white"
            }}
          >
            I'll animate when I'm removed!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

Here's what happens:

* We use React's `useState` to control visibility
* `AnimatePresence` watches its children for elements being removed
* When the element is removed (when `isVisible` becomes `false`), the `exit` animation plays
* The element fades out and moves down 20px before being removed from the DOM

## Introducing Variants: A More Structured Approach

While the properties we've covered are powerful, animations can get complex. This is where variants come in—they help organize animations and make them more reusable.

> Variants provide a structured way to define animation states, making your code cleaner and enabling propagation of animations to child components.

### Basic Variant Usage

Instead of inline objects, you define named animation states:

```jsx
import { motion } from "framer-motion";

function VariantExample() {
  // Define our animation states
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      style={{ padding: 20, backgroundColor: "#f39c12" }}
    >
      Using variants for cleaner code!
    </motion.div>
  );
}
```

In this example:

* We define an object containing two variants: `hidden` and `visible`
* Instead of passing objects to `initial` and `animate`, we pass the names of our variants
* The transition can be defined within the variant itself

### Orchestrating Multiple Elements with Variants

Where variants really shine is when orchestrating animations across multiple elements:

```jsx
import { motion } from "framer-motion";

function ListAnimation() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ 
        listStyle: "none",
        padding: 0
      }}
    >
      {[1, 2, 3, 4, 5].map(index => (
        <motion.li
          key={index}
          variants={itemVariants}
          style={{ 
            padding: 10,
            marginBottom: 10,
            backgroundColor: "#e74c3c",
            color: "white",
            borderRadius: 4
          }}
        >
          Item {index}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

Here's what makes this powerful:

* The parent `motion.ul` has its own variants
* Each child `motion.li` has its own variants
* When the parent animates to "visible", it automatically triggers the same variant in all children
* The `staggerChildren: 0.1` in the parent's transition causes each child to start its animation 0.1 seconds after the previous one, creating a staggered effect
* Child components don't need their own `initial` or `animate` props—they inherit these from the parent

### Dynamic Variants

Variants can also be functions that return animation objects, allowing for dynamic animations:

```jsx
import { motion } from "framer-motion";

function DynamicVariants() {
  const items = [1, 2, 3, 4, 5];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  // This variant is a function that receives the item's index
  const itemVariants = {
    hidden: (i) => ({
      opacity: 0,
      y: -50 * (i % 3) // Different starting positions based on index
    }),
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ 
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      {items.map((item, i) => (
        <motion.div
          key={item}
          custom={i} // Pass the index to the variant function
          variants={itemVariants}
          style={{ 
            width: 200,
            padding: 20,
            margin: 10,
            backgroundColor: `hsl(${i * 60}, 80%, 60%)`,
            borderRadius: 8
          }}
        >
          Item {item}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

In this example:

* The `hidden` variant is a function that takes a parameter
* We pass the index as a `custom` prop to each `motion.div`
* The `hidden` variant uses this index to create different starting positions
* This creates a more interesting, varied animation

### Variant Propagation Control

By default, variants propagate from parent to child, but you can control this behavior:

```jsx
import { motion } from "framer-motion";

function PropagationControl() {
  const parentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren", // Animate parent before children
        staggerChildren: 0.2,
        delayChildren: 0.5 // Delay all children by 0.5s
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div
      variants={parentVariants}
      initial="hidden"
      animate="visible"
      style={{ 
        padding: 20,
        backgroundColor: "#9b59b6",
        width: 300
      }}
    >
      <h3 style={{ color: "white" }}>Parent Element</h3>
    
      <motion.div
        variants={childVariants}
        style={{ 
          backgroundColor: "#8e44ad", 
          margin: 10,
          padding: 15,
          borderRadius: 4,
          color: "white"
        }}
      >
        Child 1
      </motion.div>
    
      <motion.div
        variants={childVariants}
        style={{ 
          backgroundColor: "#8e44ad", 
          margin: 10,
          padding: 15,
          borderRadius: 4,
          color: "white"
        }}
      >
        Child 2
      </motion.div>
    </motion.div>
  );
}
```

In this example, the parent's transition includes:

* `when: "beforeChildren"` — Ensures the parent completes its animation before children start
* `delayChildren: 0.5` — Adds a half-second delay before any children start animating
* `staggerChildren: 0.2` — Staggers the start of each child's animation by 0.2 seconds

## Advanced Transition Types

Framer Motion offers different types of transitions for different properties:

```jsx
import { motion } from "framer-motion";

function AdvancedTransitions() {
  return (
    <motion.div
      initial={{ x: 0, opacity: 0, scale: 0.5, rotate: 0 }}
      animate={{ x: 100, opacity: 1, scale: 1, rotate: 180 }}
      transition={{ 
        duration: 2,
        x: { // spring physics for x movement
          type: "spring",
          stiffness: 200,
          damping: 10
        },
        opacity: { // tween for opacity
          duration: 1
        },
        scale: { // tween with different easing
          duration: 0.8,
          ease: "easeInOut"
        },
        rotate: { // tween with delay
          duration: 1,
          delay: 0.5,
          ease: "easeIn"
        }
      }}
      style={{ 
        width: 100,
        height: 100,
        backgroundColor: "#1abc9c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold"
      }}
    >
      Multi
    </motion.div>
  );
}
```

This showcases:

* Different transition settings for each property
* A spring physics transition for the `x` position (more natural movement)
* Simple tweens with different durations for other properties
* Different easing functions
* A delay on the rotation

### Spring Physics

Springs create more natural-feeling animations:

```jsx
import { motion } from "framer-motion";

function SpringAnimation() {
  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 100 }}
      transition={{ 
        type: "spring",
        stiffness: 120, // higher = more rigid
        damping: 8,     // higher = less bouncy
        mass: 1         // higher = more sluggish
      }}
      style={{ 
        width: 80,
        height: 80,
        backgroundColor: "#27ae60",
        borderRadius: "50%"
      }}
    />
  );
}
```

This example demonstrates spring physics with:

* `stiffness` — Controls how "rigid" the spring is
* `damping` — Controls how quickly the bouncing stops
* `mass` — Controls how "heavy" the object feels

Try different values to see how they affect the feel of the animation!

## Creating a Complete Example: Animated Card

Let's pull everything together into a practical example—an interactive card component:

```jsx
import { motion } from "framer-motion";

function AnimatedCard() {
  const cardVariants = {
    initial: { 
      scale: 0.9, 
      opacity: 0,
      y: 20
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5 
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0px 15px 25px rgba(0, 0, 0, 0.15)",
      transition: { 
        type: "spring", 
        stiffness: 300 
      }
    },
    tap: { 
      scale: 0.98,
      boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)",
      transition: { 
        type: "spring", 
        stiffness: 500,
        damping: 20 
      }
    }
  };

  const contentVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        delay: 0.3,
        staggerChildren: 0.1 
      }
    }
  };
  
  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      style={{
        width: 280,
        padding: 20,
        borderRadius: 10,
        backgroundColor: "white",
        boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
        cursor: "pointer"
      }}
    >
      <motion.div variants={contentVariants}>
        <motion.h3 
          variants={itemVariants}
          style={{ margin: "0 0 10px 0" }}
        >
          Animated Card
        </motion.h3>
      
        <motion.p 
          variants={itemVariants}
          style={{ 
            margin: "0 0 15px 0",
            color: "#666",
            fontSize: 14
          }}
        >
          This card demonstrates complex animations using variants in Framer Motion.
        </motion.p>
      
        <motion.div 
          variants={itemVariants}
          style={{
            height: 100,
            backgroundColor: "#f0f0f0",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          Card Content
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
```

This example demonstrates:

* A comprehensive, multi-level variant structure
* Parent-to-child animation propagation
* Staggered animation of card contents
* Interactive state animations for hover and tap
* Spring physics for more natural interactions
* Shadow animations for depth effects

## Conclusion

We've explored Framer Motion from first principles, covering:

1. The fundamental `motion` component
2. Basic animation properties (`initial`, `animate`, `transition`)
3. Interactive animations (`whileHover`, `whileTap`)
4. Exit animations with `AnimatePresence`
5. Variants for organizing animations
6. Parent-child animation propagation
7. Dynamic variants
8. Advanced transition types and spring physics

> Animation is not just about technical implementation but about creating meaningful motion that enhances user experience. Each animation should have a purpose and contribute to the overall flow of your application.

Framer Motion gives you the tools to create beautiful, physics-based animations with minimal code. By combining the concepts we've explored, you can create rich, interactive experiences that make your React applications more engaging and intuitive.

The key to mastering Framer Motion is experimenting with these properties and finding the right balance for your specific use case. Start simple, then build up to more complex animations as you become comfortable with the library's patterns.
