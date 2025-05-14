# Accessibility Considerations in Animations with Framer Motion in React

Animations can significantly enhance user experience when implemented thoughtfully, but they can also create accessibility barriers if not designed with consideration for all users. I'll explain the key accessibility considerations for Framer Motion animations in React, building up from first principles.

## Understanding Animation Accessibility from First Principles

> At its core, accessibility means making your website or application usable by as many people as possible, regardless of their abilities or disabilities. When it comes to animations, this means ensuring that your dynamic content doesn't create barriers for users with various needs.

### The Fundamental Principles

1. **Perceivability** : Users must be able to perceive the content and information you present.
2. **Operability** : Users must be able to operate and navigate the interface.
3. **Understandability** : Users must be able to understand the content and how to operate the interface.
4. **Robustness** : Content must be robust enough to work with various assistive technologies.

Let's explore how these principles apply specifically to animations in Framer Motion.

## Motion Sensitivity and Vestibular Disorders

Some users experience motion sensitivity or vestibular disorders that can make animations physically uncomfortable or even cause symptoms like dizziness, nausea, or migraines.

> Imagine reading a book on a moving bus and feeling nauseous. For someone with a vestibular disorder, even simple animations on a static screen can trigger similar reactions.

### Implementation: Respecting User Preferences

Framer Motion provides the `useReducedMotion` hook that detects if a user has enabled the "reduce motion" setting on their device.

```jsx
import { motion, useReducedMotion } from "framer-motion";

function AnimatedComponent() {
  // This hook returns true if the user has requested reduced motion
  const shouldReduceMotion = useReducedMotion();
  
  // Conditional animation properties based on user preference
  const animationProps = shouldReduceMotion 
    ? { opacity: [0, 1] }  // Simple opacity fade only
    : { 
        opacity: [0, 1],
        x: [-100, 0],      // Includes motion
        scale: [0.8, 1]
      };
  
  return (
    <motion.div
      animate={animationProps}
      transition={{ duration: 0.5 }}
    >
      Content here
    </motion.div>
  );
}
```

In this example, we check if the user prefers reduced motion and adapt our animations accordingly. For users with motion sensitivity, we provide a simpler animation that only changes opacity, avoiding spatial movement that might cause discomfort.

## Flashing Content and Photosensitive Epilepsy

Rapidly flashing animations or high-contrast flickering elements can trigger seizures in people with photosensitive epilepsy.

### Implementation: Safe Animation Rates

```jsx
import { motion } from "framer-motion";

// GOOD: Safe animation with moderate speed
function SafeAnimation() {
  return (
    <motion.div
      animate={{ opacity: [0, 1, 0, 1] }}
      transition={{ 
        duration: 2,       // Slower duration
        repeat: Infinity,
        repeatDelay: 1     // Pause between repetitions
      }}
    >
      Content here
    </motion.div>
  );
}

// BAD: Potentially harmful rapid flashing (DO NOT USE)
function UnsafeAnimation() {
  return (
    <motion.div
      animate={{ opacity: [0, 1, 0, 1] }}
      transition={{ 
        duration: 0.2,     // Too fast - could cause issues
        repeat: Infinity
      }}
    >
      Content here
    </motion.div>
  );
}
```

The key point here is to avoid animations that flash more than three times per second (3Hz) and to avoid stark contrast changes in those animations.

## Animation Duration and Cognitive Accessibility

Users with cognitive disabilities may need more time to process changes on the screen. Animations that are too fast can create confusion.

### Implementation: Appropriate Timing

```jsx
import { motion } from "framer-motion";

function CognitiveAccessibleAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.7,     // Not too fast, not too slow
        ease: "easeOut"    // Smooth deceleration
      }}
    >
      New content appears here
    </motion.div>
  );
}
```

This animation provides enough time for users to notice and process the change, with a smooth easing function that makes the movement more natural and easier to follow.

## Focus Management for Screen Reader Users

Screen reader users need to be able to keep track of their focus point, especially when content changes or moves.

### Implementation: Maintaining Focus

```jsx
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

function FocusAwareAnimation() {
  const elementRef = useRef(null);
  const wasVisible = useRef(false);
  
  // Animation variants
  const variants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto" }
  };
  
  // Focus management after animation completes
  useEffect(() => {
    const element = elementRef.current;
    // Only focus if the element is becoming visible
    if (element && !wasVisible.current) {
      // Small delay to allow animation to complete
      const timer = setTimeout(() => {
        element.focus();
        wasVisible.current = true;
      }, 500);
    
      return () => clearTimeout(timer);
    }
  }, []);
  
  return (
    <motion.div
      ref={elementRef}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.5 }}
      tabIndex={-1} // Makes div focusable but not in tab order
      aria-live="polite" // Announces changes to screen readers
    >
      New content here
    </motion.div>
  );
}
```

This example shows how to manage focus after an animation completes, ensuring that screen reader users don't lose their place when content changes.

## ARIA Live Regions for Dynamic Content

When content changes dynamically through animations, screen reader users need to be notified of these changes.

### Implementation: Aria-live Regions

```jsx
import { motion } from "framer-motion";

function AnnouncedAnimation() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        aria-live="polite"
        aria-atomic="true"
      >
        This content change will be announced to screen reader users
      </motion.div>
    </div>
  );
}
```

The `aria-live` attribute tells screen readers to announce changes to this element, while `aria-atomic="true"` ensures the entire content is announced, not just the changes.

## Providing Controls for Animation

Users should have the ability to pause, stop, or control animations, especially for longer or continuous animations.

### Implementation: User Controls

```jsx
import { motion, useAnimation } from "framer-motion";
import { useState } from "react";

function ControlledAnimation() {
  const controls = useAnimation();
  const [isPlaying, setIsPlaying] = useState(true);
  
  const toggleAnimation = () => {
    if (isPlaying) {
      controls.stop();
    } else {
      controls.start({ rotate: 360, transition: { duration: 2, repeat: Infinity }});
    }
    setIsPlaying(!isPlaying);
  };
  
  // Start animation on component mount
  useEffect(() => {
    controls.start({ rotate: 360, transition: { duration: 2, repeat: Infinity }});
  }, []);
  
  return (
    <div>
      <motion.div
        animate={controls}
        style={{ width: 100, height: 100, background: "blue" }}
      />
    
      <button 
        onClick={toggleAnimation}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? "Pause animation" : "Play animation"}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
```

This example provides a button to toggle the animation, with appropriate ARIA attributes to communicate the control's state to screen readers.

## Alternative Content for Screen Readers

For purely decorative animations, you might want to hide them from screen readers, while for informative animations, you should provide alternative text.

### Implementation: Appropriate ARIA Attributes

```jsx
import { motion } from "framer-motion";

// Decorative animation that doesn't convey information
function DecorativeAnimation() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity }}
      aria-hidden="true" // Hides from screen readers
      style={{ width: 50, height: 50, background: "purple" }}
    />
  );
}

// Animation that conveys information
function InformativeAnimation() {
  return (
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
      aria-label="Loading content" // Describes purpose to screen readers
      role="status" // Indicates this is a status update
      style={{ width: 100, height: 100, background: "green" }}
    />
  );
}
```

For decorative animations, use `aria-hidden="true"`. For informative animations, provide descriptive `aria-label` and appropriate ARIA roles.

## Performance Considerations

Poor performance can affect accessibility, especially for users with older devices or cognitive impairments.

### Implementation: Optimizing Animation Performance

```jsx
import { motion } from "framer-motion";

function OptimizedAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.5,
        // Use hardware acceleration for smoother animation
        type: "tween"
      }}
      style={{ 
        // Hint to the browser that this element will be animated
        willChange: "opacity",
        // Using transform instead of position properties for better performance
        transform: "translateZ(0)"
      }}
    >
      Content here
    </motion.div>
  );
}
```

By optimizing performance, you ensure that animations run smoothly for all users, which is particularly important for those with cognitive disabilities who might be confused by janky or erratic animations.

## Building a Comprehensive Accessibility Solution

Now let's combine these principles into a more comprehensive example:

```jsx
import { motion, useReducedMotion, useAnimation } from "framer-motion";
import { useState, useEffect, useRef } from "react";

function AccessibleAnimatedCard({ title, content, isImportant }) {
  // Check for reduced motion preference
  const shouldReduceMotion = useReducedMotion();
  const controls = useAnimation();
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef(null);
  
  // Define different variants based on motion preferences
  const variants = {
    hidden: { opacity: 0 },
    visible: shouldReduceMotion 
      ? { opacity: 1 } 
      : { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" }
        }
  };
  
  // If reduced motion is preferred, still show the element, just without animation
  if (shouldReduceMotion) {
    variants.hidden = { opacity: 0.9 }; // Start almost visible
  } else {
    variants.hidden.y = 20; // Add motion for those who can handle it
  }
  
  const startAnimation = () => {
    setIsAnimating(true);
    controls.start("visible").then(() => {
      setIsAnimating(false);
      // Focus the element if it's important
      if (isImportant && cardRef.current) {
        cardRef.current.focus();
      }
    });
  };
  
  const stopAnimation = () => {
    controls.stop();
    setIsAnimating(false);
  };
  
  useEffect(() => {
    startAnimation();
  }, []);
  
  return (
    <div>
      <motion.div
        ref={cardRef}
        className="card"
        initial="hidden"
        animate={controls}
        variants={variants}
        tabIndex={isImportant ? 0 : -1}
        aria-live={isImportant ? "polite" : "off"}
        style={{
          padding: 20,
          background: "#f0f0f0",
          borderRadius: 8,
          marginBottom: 20,
          willChange: "transform, opacity"
        }}
      >
        <h3>{title}</h3>
        <p>{content}</p>
      </motion.div>
    
      {/* Only show controls if the card is currently animating */}
      {isAnimating && (
        <button
          onClick={stopAnimation}
          aria-label="Stop animation"
        >
          Stop Animation
        </button>
      )}
    </div>
  );
}
```

This component:

1. Respects reduced motion preferences
2. Provides different animation variants based on user preferences
3. Manages focus for important content
4. Uses ARIA live regions for important updates
5. Provides controls to stop animations
6. Optimizes performance

## Creating an Animation Preferences Component

Let's build a user preference component that allows users to control animation settings directly:

```jsx
import { createContext, useState, useContext } from "react";

// Create context for animation preferences
const AnimationPreferencesContext = createContext({
  reduceMotion: false,
  animationSpeed: "normal", // slow, normal, fast
  disableAnimations: false,
  updatePreferences: () => {}
});

// Provider component
export function AnimationPreferencesProvider({ children }) {
  // Get initial settings from localStorage if available
  const getInitialState = () => {
    try {
      const savedPrefs = localStorage.getItem("animationPreferences");
      return savedPrefs ? JSON.parse(savedPrefs) : {
        reduceMotion: false,
        animationSpeed: "normal",
        disableAnimations: false
      };
    } catch (error) {
      console.error("Error reading animation preferences:", error);
      return {
        reduceMotion: false,
        animationSpeed: "normal",
        disableAnimations: false
      };
    }
  };
  
  const [preferences, setPreferences] = useState(getInitialState);
  
  const updatePreferences = (newPrefs) => {
    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);
    // Save to localStorage
    try {
      localStorage.setItem("animationPreferences", JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error("Error saving animation preferences:", error);
    }
  };
  
  return (
    <AnimationPreferencesContext.Provider
      value={{
        ...preferences,
        updatePreferences
      }}
    >
      {children}
    </AnimationPreferencesContext.Provider>
  );
}

// Custom hook to use the preferences
export function useAnimationPreferences() {
  return useContext(AnimationPreferencesContext);
}

// User interface for controlling preferences
export function AnimationPreferencesControl() {
  const { 
    reduceMotion, 
    animationSpeed, 
    disableAnimations, 
    updatePreferences 
  } = useAnimationPreferences();
  
  return (
    <div className="animation-preferences">
      <h2>Animation Settings</h2>
    
      <div className="preference-option">
        <input
          type="checkbox"
          id="disable-animations"
          checked={disableAnimations}
          onChange={(e) => updatePreferences({ disableAnimations: e.target.checked })}
        />
        <label htmlFor="disable-animations">
          Disable all animations
        </label>
      </div>
    
      <div className="preference-option">
        <input
          type="checkbox"
          id="reduce-motion"
          checked={reduceMotion}
          onChange={(e) => updatePreferences({ reduceMotion: e.target.checked })}
          disabled={disableAnimations}
        />
        <label htmlFor="reduce-motion">
          Reduce motion (simplified animations)
        </label>
      </div>
    
      <fieldset disabled={disableAnimations}>
        <legend>Animation Speed</legend>
      
        <div className="radio-option">
          <input
            type="radio"
            id="speed-slow"
            name="animation-speed"
            value="slow"
            checked={animationSpeed === "slow"}
            onChange={() => updatePreferences({ animationSpeed: "slow" })}
          />
          <label htmlFor="speed-slow">Slow</label>
        </div>
      
        <div className="radio-option">
          <input
            type="radio"
            id="speed-normal"
            name="animation-speed"
            value="normal"
            checked={animationSpeed === "normal"}
            onChange={() => updatePreferences({ animationSpeed: "normal" })}
          />
          <label htmlFor="speed-normal">Normal</label>
        </div>
      
        <div className="radio-option">
          <input
            type="radio"
            id="speed-fast"
            name="animation-speed"
            value="fast"
            checked={animationSpeed === "fast"}
            onChange={() => updatePreferences({ animationSpeed: "fast" })}
          />
          <label htmlFor="speed-fast">Fast</label>
        </div>
      </fieldset>
    </div>
  );
}
```

This set of components creates a context-based system for managing animation preferences throughout your application.

## Creating an Accessible Loading Animation

Let's implement a common use case - an accessible loading spinner:

```jsx
import { motion, useReducedMotion } from "framer-motion";
import { useAnimationPreferences } from "./AnimationPreferencesContext";

function AccessibleLoadingSpinner({ size = 40, color = "#3498db" }) {
  // Check both system preference and user preference
  const systemReduceMotion = useReducedMotion();
  const { reduceMotion, disableAnimations, animationSpeed } = useAnimationPreferences();
  
  // Respect either system or user preference
  const shouldReduceMotion = systemReduceMotion || reduceMotion;
  
  // Don't animate if animations are disabled
  if (disableAnimations) {
    return (
      <div
        role="status"
        aria-label="Loading"
        style={{ 
          width: size, 
          height: size, 
          borderRadius: "50%",
          border: `4px solid ${color}`,
          margin: "0 auto"
        }}
      >
        <span style={{ visibility: "hidden" }}>Loading...</span>
      </div>
    );
  }
  
  // Determine animation duration based on speed preference
  const getDuration = () => {
    switch (animationSpeed) {
      case "slow": return 2;
      case "fast": return 0.8;
      default: return 1.2;
    }
  };
  
  // For users who prefer reduced motion
  if (shouldReduceMotion) {
    return (
      <motion.div
        role="status"
        aria-label="Loading"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ 
          repeat: Infinity, 
          repeatType: "reverse", 
          duration: getDuration() 
        }}
        style={{ 
          width: size, 
          height: size, 
          borderRadius: "50%",
          background: color,
          margin: "0 auto"
        }}
      >
        <span style={{ visibility: "hidden" }}>Loading...</span>
      </motion.div>
    );
  }
  
  // Standard spinning animation for users without motion sensitivity
  return (
    <motion.div
      role="status"
      aria-label="Loading"
      animate={{ rotate: 360 }}
      transition={{ 
        repeat: Infinity, 
        ease: "linear", 
        duration: getDuration() 
      }}
      style={{ 
        width: size, 
        height: size, 
        borderRadius: "50%",
        border: "4px solid #f3f3f3",
        borderTop: `4px solid ${color}`,
        margin: "0 auto"
      }}
    >
      <span style={{ visibility: "hidden" }}>Loading...</span>
    </motion.div>
  );
}
```

This loading spinner:

1. Respects both system and user preferences for reduced motion
2. Provides alternate animations for different user needs
3. Uses proper ARIA attributes for screen readers
4. Adjusts animation speed based on user preferences
5. Has a static fallback when animations are disabled

## Testing Animation Accessibility

It's important to test your animations with different user needs in mind:

1. **Screen Reader Testing** : Use tools like VoiceOver (Mac), NVDA (Windows), or TalkBack (Android) to test how your animations are announced.
2. **Reduced Motion Testing** : Enable "reduce motion" in your operating system settings to test your reduced motion adaptations.
3. **Keyboard Navigation** : Ensure all interactive animated elements can be accessed and controlled using keyboard alone.
4. **Performance Testing** : Test on older devices or throttle CPU in Chrome DevTools to ensure animations remain smooth.

## Putting It All Together: A Complete Accessible Animation Framework

Here's how we can combine everything we've learned into a comprehensive framework for accessibility in Framer Motion:

```jsx
import { createContext, useContext, useState, useEffect } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

// Create a context for application-wide animation settings
const AnimationAccessibilityContext = createContext({
  prefersReducedMotion: false,
  animationSpeed: 1,
  highContrastMode: false,
  animationsEnabled: true
});

// Provider component
export function AnimationAccessibilityProvider({ children }) {
  // Check system preferences
  const systemReduceMotion = useReducedMotion();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(systemReduceMotion);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  
  // Load user preferences from localStorage on mount
  useEffect(() => {
    try {
      const storedPrefs = localStorage.getItem("animationAccessibility");
      if (storedPrefs) {
        const parsedPrefs = JSON.parse(storedPrefs);
        setPrefersReducedMotion(parsedPrefs.prefersReducedMotion ?? systemReduceMotion);
        setAnimationSpeed(parsedPrefs.animationSpeed ?? 1);
        setHighContrastMode(parsedPrefs.highContrastMode ?? false);
        setAnimationsEnabled(parsedPrefs.animationsEnabled ?? true);
      }
    } catch (error) {
      console.error("Error loading animation preferences:", error);
    }
  }, [systemReduceMotion]);
  
  // Save preferences when they change
  useEffect(() => {
    try {
      localStorage.setItem("animationAccessibility", JSON.stringify({
        prefersReducedMotion,
        animationSpeed,
        highContrastMode,
        animationsEnabled
      }));
    } catch (error) {
      console.error("Error saving animation preferences:", error);
    }
  }, [prefersReducedMotion, animationSpeed, highContrastMode, animationsEnabled]);
  
  const contextValue = {
    prefersReducedMotion,
    setPrefersReducedMotion,
    animationSpeed,
    setAnimationSpeed,
    highContrastMode,
    setHighContrastMode,
    animationsEnabled,
    setAnimationsEnabled
  };
  
  return (
    <AnimationAccessibilityContext.Provider value={contextValue}>
      {children}
    </AnimationAccessibilityContext.Provider>
  );
}

// Custom hook to use the accessibility context
export function useAnimationAccessibility() {
  return useContext(AnimationAccessibilityContext);
}

// Create a component to wrap animated elements with accessibility features
export function AccessibleMotion({
  children,
  type = "div",
  variants,
  initial,
  animate,
  exit,
  transition,
  isImportant = false,
  description = "",
  ...props
}) {
  const { 
    prefersReducedMotion,
    animationSpeed,
    animationsEnabled
  } = useAnimationAccessibility();
  
  // Adjust the transition based on user preferences
  const accessibleTransition = {
    ...transition,
    duration: transition?.duration 
      ? transition.duration * (1/animationSpeed) 
      : undefined
  };
  
  // For users who prefer no animations
  if (!animationsEnabled) {
    // For AnimatePresence, we need to render the final state immediately
    if (exit && typeof animate === 'string' && variants) {
      // Render the component in its final state without animation
      const MotionComponent = motion[type];
      return (
        <MotionComponent
          {...props}
          style={{
            ...variants[animate],
            ...props.style
          }}
          aria-hidden={!isImportant}
          aria-live={isImportant ? "polite" : "off"}
          aria-label={description || undefined}
        >
          {children}
        </MotionComponent>
      );
    }
  
    // For simple animations, just render without motion props
    return React.createElement(
      type,
      {
        ...props,
        'aria-hidden': !isImportant,
        'aria-live': isImportant ? "polite" : "off",
        'aria-label': description || undefined
      },
      children
    );
  }
  
  // For users who prefer reduced motion
  if (prefersReducedMotion) {
    // Create simplified variants that only use opacity if the original had movement
    let reducedVariants = variants;
  
    if (variants) {
      reducedVariants = Object.entries(variants).reduce((acc, [key, value]) => {
        // Check if this variant includes spatial movement
        const hasMovement = Object.keys(value).some(prop => 
          ['x', 'y', 'translateX', 'translateY', 'scale', 'rotate'].includes(prop)
        );
      
        if (hasMovement) {
          // Keep only opacity transitions for reduced motion
          acc[key] = { 
            opacity: value.opacity !== undefined ? value.opacity : 1
          };
        } else {
          acc[key] = value;
        }
      
        return acc;
      }, {});
    }
  
    const MotionComponent = motion[type];
    return (
      <MotionComponent
        {...props}
        variants={reducedVariants}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={accessibleTransition}
        aria-hidden={!isImportant}
        aria-live={isImportant ? "polite" : "off"}
        aria-label={description || undefined}
      >
        {children}
      </MotionComponent>
    );
  }
  
  // For users without special needs, use full animations
  const MotionComponent = motion[type];
  return (
    <MotionComponent
      {...props}
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={accessibleTransition}
      aria-hidden={!isImportant}
      aria-live={isImportant ? "polite" : "off"}
      aria-label={description || undefined}
    >
      {children}
    </MotionComponent>
  );
}

// A sample UI component for setting preferences
export function AccessibilityPreferencesPanel() {
  const {
    prefersReducedMotion,
    setPrefersReducedMotion,
    animationSpeed,
    setAnimationSpeed,
    animationsEnabled,
    setAnimationsEnabled
  } = useAnimationAccessibility();
  
  return (
    <div className="accessibility-panel">
      <h2>Animation Accessibility Settings</h2>
    
      <div className="option">
        <input
          type="checkbox"
          id="enable-animations"
          checked={animationsEnabled}
          onChange={(e) => setAnimationsEnabled(e.target.checked)}
        />
        <label htmlFor="enable-animations">
          Enable animations
        </label>
      </div>
    
      <div className="option">
        <input
          type="checkbox"
          id="reduce-motion"
          checked={prefersReducedMotion}
          onChange={(e) => setPrefersReducedMotion(e.target.checked)}
          disabled={!animationsEnabled}
        />
        <label htmlFor="reduce-motion">
          Reduce motion
        </label>
      </div>
    
      <div className="option">
        <label htmlFor="animation-speed">
          Animation speed: {animationSpeed}x
        </label>
        <input
          type="range"
          id="animation-speed"
          min="0.5"
          max="2"
          step="0.1"
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
          disabled={!animationsEnabled}
        />
      </div>
    </div>
  );
}
```

This framework provides:

1. A context system for storing and managing animation preferences
2. A wrapper component that adapts animations based on user needs
3. A settings panel for users to customize their experience
4. Proper ARIA attributes for screen reader compatibility
5. localStorage persistence for user preferences
6. Protection for users with vestibular disorders

## Practical Usage Example: Accessible Page Transitions

Here's how to implement accessible page transitions with our framework:

```jsx
import { AccessibleMotion, useAnimationAccessibility } from "./AnimationAccessibility";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  
  const pageVariants = {
    hidden: { opacity: 0, x: -300 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 300 }
  };
  
  return (
    <AnimationAccessibilityProvider>
      <header>
        <nav>{/* Navigation links */}</nav>
        <AccessibilityPreferencesPanel />
      </header>
    
      <main>
        <AnimatePresence mode="wait">
          <AccessibleMotion
            key={location.pathname}
            type="div"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4 }}
            isImportant={true}
            description={`Page: ${location.pathname}`}
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </AccessibleMotion>
        </AnimatePresence>
      </main>
    
      <footer>{/* Footer content */}</footer>
    </AnimationAccessibilityProvider>
  );
}
```

This implementation:

1. Wraps the entire application in the animation accessibility provider
2. Uses `AccessibleMotion` for page transitions that respect user preferences
3. Provides a settings panel for users to customize their experience
4. Uses `AnimatePresence` for proper enter/exit animations
5. Provides appropriate ARIA descriptions for screen readers

## Conclusion

> Accessibility is not just a checklist item; it's a fundamental part of creating a web that works for everyone. With Framer Motion, we have powerful tools to create animations that enhance rather than detract from the user experience.

Creating accessible animations with Framer Motion involves:

1. Understanding that different users have different needs
2. Respecting system preferences for reduced motion
3. Providing controls for users to customize their experience
4. Using appropriate ARIA attributes for screen readers
5. Managing focus for dynamic content
6. Avoiding animations that could cause harm or discomfort
