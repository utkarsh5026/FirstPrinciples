# Emotion for CSS Composition in React: From First Principles

Emotion is a powerful CSS-in-JS library that allows you to write CSS styles with JavaScript. To understand Emotion fully, we need to start from the most fundamental concepts of styling in web development and build our way up to understanding how Emotion elegantly solves many common styling challenges in React applications.

## The Evolution of CSS in Web Development

> "The separation of HTML and CSS was one of the best innovations in web development. The integration of CSS and JavaScript may be the next evolutionary step."

Before diving into Emotion specifically, let's understand why CSS-in-JS solutions emerged in the first place.

### Traditional CSS Approaches

Traditional CSS involves writing styles in separate .css files and linking them to HTML documents. While this approach works well for static websites, it presents several challenges in component-based architectures like React:

1. **Global Namespace** : All CSS selectors exist in a global namespace, leading to potential naming conflicts
2. **Lack of Scoping** : Styles can unintentionally affect unrelated elements
3. **No Dead Code Elimination** : Unused CSS often remains in the codebase
4. **Limited Dynamic Styling** : Changing styles based on props or state is cumbersome
5. **No Dependency Management** : CSS files don't express their dependencies

These limitations led to the development of various CSS methodologies like BEM (Block Element Modifier), SMACSS, and OOCSS, which all attempt to create conventions for writing more maintainable CSS. However, they still rely on developer discipline rather than enforced constraints.

## The Rise of CSS-in-JS

CSS-in-JS libraries like Emotion emerged to address these limitations by bringing CSS into the JavaScript ecosystem, allowing developers to:

1. **Scope styles to components** : Preventing unintended side effects
2. **Use JavaScript variables in styles** : Making dynamic styling easier
3. **Co-locate styles with components** : Improving maintainability
4. **Leverage JavaScript for style composition** : Creating more reusable styling patterns

## Emotion: Core Concepts

Emotion is a CSS-in-JS library that provides multiple approaches to styling React components. Let's explore its core concepts from the ground up.

### 1. The `css` Prop Approach

The most direct way to use Emotion in React is with the `css` prop, which allows you to write CSS directly on any element:

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

function Button({ primary }) {
  return (
    <button
      css={css`
        padding: 8px 16px;
        border-radius: 4px;
        background-color: ${primary ? 'blue' : 'gray'};
        color: white;
        font-size: 14px;
      
        &:hover {
          opacity: 0.8;
        }
      `}
    >
      Click Me
    </button>
  );
}
```

In this example:

* We're using the `css` prop directly on the button element
* We're using a template literal to write actual CSS syntax
* We're dynamically setting the background color based on the `primary` prop
* We're using nested selectors (`&:hover`) similar to Sass/SCSS

The `css` prop approach requires the JSX pragma comment at the top (`/** @jsxImportSource @emotion/react */`), which tells the compiler how to process the `css` prop.

### 2. The `styled` API

Emotion also provides a `styled` API, which is inspired by styled-components and allows you to create styled components:

```jsx
import styled from '@emotion/styled';

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  background-color: ${props => props.primary ? 'blue' : 'gray'};
  color: white;
  font-size: 14px;
  
  &:hover {
    opacity: 0.8;
  }
`;

function App() {
  return (
    <div>
      <Button>Normal Button</Button>
      <Button primary>Primary Button</Button>
    </div>
  );
}
```

The `styled` API creates a new React component that renders the specified HTML element with the applied styles. Props passed to the component can be used in the style definition.

## Style Composition in Emotion

> "Composition is the essence of software development, and Emotion brings that power to CSS."

Now that we understand the basic approaches, let's dive deeper into style composition, which is one of Emotion's most powerful features.

### 1. Object Styles vs. String Styles

Emotion supports two ways of writing styles:

**String Styles** (using template literals):

```jsx
css`
  color: red;
  font-size: 14px;
`;
```

**Object Styles** (using JavaScript objects):

```jsx
css({
  color: 'red',
  fontSize: '14px'
});
```

Object styles use camelCase property names (like `fontSize` instead of `font-size`), following the JavaScript convention.

### 2. Basic Style Composition

One of the fundamental ways to compose styles in Emotion is by combining multiple style definitions:

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

const baseStyles = css`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
`;

const primaryStyles = css`
  background-color: blue;
  color: white;
`;

const secondaryStyles = css`
  background-color: gray;
  color: white;
`;

function Button({ primary }) {
  return (
    <button css={[baseStyles, primary ? primaryStyles : secondaryStyles]}>
      Click Me
    </button>
  );
}
```

In this example:

* We define a `baseStyles` object with common styles
* We define `primaryStyles` and `secondaryStyles` for different button variants
* We compose these styles by passing an array to the `css` prop
* Later styles override earlier ones in case of conflicts

### 3. Dynamic Style Composition

Emotion makes it easy to create styles dynamically based on props or state:

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

const buttonStyles = ({ size, color, outline }) => css`
  padding: ${size === 'small' ? '4px 8px' : size === 'large' ? '12px 24px' : '8px 16px'};
  font-size: ${size === 'small' ? '12px' : size === 'large' ? '16px' : '14px'};
  border-radius: 4px;
  
  ${outline
    ? css`
        background-color: transparent;
        border: 2px solid ${color};
        color: ${color};
      `
    : css`
        background-color: ${color};
        border: none;
        color: white;
      `
  }
  
  &:hover {
    opacity: 0.8;
  }
`;

function Button({ size, color = 'blue', outline }) {
  return (
    <button css={buttonStyles({ size, color, outline })}>
      Click Me
    </button>
  );
}
```

This example creates a flexible button component where:

* Size affects padding and font size
* Color sets the button's primary color
* Outline determines if it's a solid or outlined button

### 4. Theme-Based Styling

Emotion integrates beautifully with themes via its `ThemeProvider`:

```jsx
/** @jsxImportSource @emotion/react */
import { css, ThemeProvider } from '@emotion/react';

// Define our theme
const theme = {
  colors: {
    primary: '#0070f3',
    secondary: '#ff4081',
    text: '#333',
    background: '#fff'
  },
  fontSizes: {
    small: '12px',
    medium: '14px',
    large: '16px'
  },
  spacing: {
    small: '4px',
    medium: '8px',
    large: '16px'
  }
};

// Create a component that uses the theme
const ThemedButton = ({ variant = 'primary' }) => {
  return (
    <button
      css={theme => css`
        background-color: ${theme.colors[variant]};
        color: white;
        padding: ${theme.spacing.medium} ${theme.spacing.large};
        font-size: ${theme.fontSizes.medium};
        border-radius: 4px;
        border: none;
      
        &:hover {
          opacity: 0.9;
        }
      `}
    >
      Themed Button
    </button>
  );
};

// Use the ThemeProvider to make the theme available
function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <ThemedButton variant="primary" />
        <ThemedButton variant="secondary" />
      </div>
    </ThemeProvider>
  );
}
```

In this example:

* We define a theme object with colors, font sizes, and spacing values
* The `ThemeProvider` makes this theme available to all components in its tree
* The `ThemedButton` component accesses the theme to style itself
* This creates consistent, themeable UI components

### 5. Component-Based Style Composition

With Emotion's `styled` API, we can extend existing components:

```jsx
import styled from '@emotion/styled';

// Base button component
const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
`;

// Primary button extends the base button
const PrimaryButton = styled(Button)`
  background-color: blue;
  color: white;
  
  &:hover {
    background-color: darkblue;
  }
`;

// Secondary button also extends the base button
const SecondaryButton = styled(Button)`
  background-color: gray;
  color: white;
  
  &:hover {
    background-color: darkgray;
  }
`;

// Outlined button extends the primary button but overrides some styles
const OutlinedPrimaryButton = styled(PrimaryButton)`
  background-color: transparent;
  border: 2px solid blue;
  color: blue;
  
  &:hover {
    background-color: rgba(0, 0, 255, 0.1);
  }
`;
```

This approach creates a hierarchy of styled components, where each builds upon the previous one. This is a powerful way to create consistent component variations.

## Advanced Style Composition Techniques

> "The most powerful patterns emerge from composing simpler primitives."

Now let's explore some more advanced composition techniques.

### 1. Style Functions

Creating reusable style functions can help maintain consistency and reduce duplication:

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

// Style functions for common patterns
const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const boxShadow = level => {
  const shadows = {
    1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    3: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
  };
  
  return css`box-shadow: ${shadows[level] || shadows[1]};`;
};

// Using style functions in components
function Card({ level, children }) {
  return (
    <div
      css={[
        flexCenter,
        boxShadow(level),
        css`
          padding: 16px;
          border-radius: 4px;
          background-color: white;
        `
      ]}
    >
      {children}
    </div>
  );
}
```

These style functions create reusable styling patterns that can be composed together.

### 2. Responsive Styles

Emotion makes responsive designs straightforward:

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

// Breakpoint helpers
const breakpoints = {
  sm: '@media (min-width: 576px)',
  md: '@media (min-width: 768px)',
  lg: '@media (min-width: 992px)',
  xl: '@media (min-width: 1200px)'
};

function ResponsiveCard() {
  return (
    <div
      css={css`
        padding: 16px;
        font-size: 14px;
        background-color: #f0f0f0;
      
        ${breakpoints.sm} {
          padding: 24px;
          font-size: 16px;
        }
      
        ${breakpoints.md} {
          padding: 32px;
          display: flex;
        }
      
        ${breakpoints.lg} {
          max-width: 960px;
          margin: 0 auto;
        }
      `}
    >
      Card Content
    </div>
  );
}
```

This example shows how to create responsive styles that adapt to different screen sizes using Emotion's nested syntax.

### 3. Global Styles

Sometimes you need to apply global styles, which Emotion supports via the `Global` component:

```jsx
/** @jsxImportSource @emotion/react */
import { Global, css } from '@emotion/react';

function App() {
  return (
    <>
      <Global
        styles={css`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
        
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.5;
            color: #333;
          }
        
          a {
            color: #0070f3;
            text-decoration: none;
          
            &:hover {
              text-decoration: underline;
            }
          }
        `}
      />
      <div>App Content</div>
    </>
  );
}
```

The `Global` component injects styles into the document head, similar to traditional global CSS files.

### 4. Keyframe Animations

Emotion supports CSS animations through the `keyframes` helper:

```jsx
/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';

// Define a keyframe animation
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

function AnimatedButton() {
  return (
    <button
      css={css`
        padding: 8px 16px;
        background-color: blue;
        color: white;
        border: none;
        border-radius: 4px;
      
        /* Apply the animation */
        animation: ${fadeIn} 0.5s ease-in-out;
      
        &:hover {
          animation: ${pulse} 1s infinite;
        }
      `}
    >
      Animated Button
    </button>
  );
}
```

This example defines two animations and applies them to a button on load and on hover.

## Practical Examples: Building a UI System

Let's put all these concepts together to build a simple UI system using Emotion's composition techniques.

### Creating a Button System

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';

// Base button styles
const baseButtonStyles = css`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
  
  &:focus {
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
  }
`;

// Size variants
const buttonSizes = {
  small: css`
    padding: 4px 8px;
    font-size: 12px;
  `,
  medium: baseButtonStyles,
  large: css`
    padding: 12px 24px;
    font-size: 16px;
  `
};

// Variant styles
const buttonVariants = {
  primary: css`
    background-color: #0070f3;
    color: white;
  
    &:hover {
      background-color: #0051cc;
    }
  
    &:active {
      background-color: #004099;
    }
  `,
  secondary: css`
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
  
    &:hover {
      background-color: #e5e5e5;
    }
  
    &:active {
      background-color: #d5d5d5;
    }
  `,
  danger: css`
    background-color: #ff4d4f;
    color: white;
  
    &:hover {
      background-color: #ff1f1f;
    }
  
    &:active {
      background-color: #e50e0e;
    }
  `
};

// State styles
const buttonStates = {
  disabled: css`
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `,
  loading: css`
    position: relative;
    color: transparent;
  
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }
  
    @keyframes spin {
      to {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }
  `
};

// Button component
function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  ...props
}) {
  return (
    <button
      css={[
        baseButtonStyles,
        buttonSizes[size],
        buttonVariants[variant],
        disabled && buttonStates.disabled,
        loading && buttonStates.loading
      ]}
      disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
}

// Demo component to showcase the button system
function ButtonDemo() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };
  
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: 16px;
      `}
    >
      <div>
        <h3>Variants</h3>
        <div
          css={css`
            display: flex;
            gap: 8px;
          `}
        >
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </div>
    
      <div>
        <h3>Sizes</h3>
        <div
          css={css`
            display: flex;
            gap: 8px;
            align-items: center;
          `}
        >
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
        </div>
      </div>
    
      <div>
        <h3>States</h3>
        <div
          css={css`
            display: flex;
            gap: 8px;
          `}
        >
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button loading={isLoading} onClick={handleClick}>
            Click to Load
          </Button>
        </div>
      </div>
    </div>
  );
}
```

This example demonstrates:

1. Creating a flexible button component with different variants, sizes, and states
2. Using style composition to combine styles based on props
3. Handling interactive states (disabled, loading)
4. Creating a demo to showcase the component's capabilities

## Performance Considerations

> "Performance isn't just about speed; it's about creating a smooth and responsive user experience."

When using Emotion for CSS composition in React, it's important to consider performance:

### 1. Style Memoization

To prevent unnecessary style recalculations, use the `useMemo` hook for dynamic styles:

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useMemo } from 'react';

function PerformantButton({ primary, disabled }) {
  // Memoize the styles based on props
  const buttonStyles = useMemo(
    () => css`
      padding: 8px 16px;
      background-color: ${primary ? 'blue' : 'gray'};
      opacity: ${disabled ? 0.5 : 1};
      cursor: ${disabled ? 'not-allowed' : 'pointer'};
    `,
    [primary, disabled]
  );
  
  return <button css={buttonStyles}>Click Me</button>;
}
```

This ensures that styles are only recalculated when the dependencies change.

### 2. Using the Babel Plugin

Emotion offers a Babel plugin that optimizes the CSS output and adds support for source maps:

```javascript
// babel.config.js
module.exports = {
  plugins: ['@emotion']
};
```

The Babel plugin:

* Transforms styles at build time for better performance
* Adds helpful debugging information like component names in development
* Optimizes the CSS output for production

### 3. Server-Side Rendering

For applications that require server-side rendering (SSR), Emotion provides built-in support:

```jsx
// In a Next.js _document.js file
import Document, { Html, Head, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import { cache } from '@emotion/css';

const { extractCritical } = createEmotionServer(cache);

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const styles = extractCritical(initialProps.html);
  
    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          <style
            data-emotion={`css ${styles.ids.join(' ')}`}
            dangerouslySetInnerHTML={{ __html: styles.css }}
          />
        </>
      )
    };
  }
  
  // ... rest of the Document class
}
```

This ensures that styles are properly extracted and included in the initial HTML, preventing the "flash of unstyled content" that can occur with client-side styling solutions.

## Common Patterns and Best Practices

Let's explore some common patterns and best practices for using Emotion effectively in React applications.

### 1. Creating a Design System

Using Emotion's composition capabilities, you can build a comprehensive design system:

```jsx
/** @jsxImportSource @emotion/react */
import { css, ThemeProvider } from '@emotion/react';

// Define our theme
const theme = {
  colors: {
    primary: '#0070f3',
    secondary: '#ff4081',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    text: {
      primary: '#333',
      secondary: '#666',
      light: '#999'
    },
    background: {
      light: '#fff',
      dark: '#f8f9fa'
    }
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  breakpoints: {
    xs: '@media (min-width: 0px)',
    sm: '@media (min-width: 576px)',
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 992px)',
    xl: '@media (min-width: 1200px)'
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
  },
  borderRadius: {
    sm: '2px',
    md: '4px',
    lg: '8px',
    pill: '9999px'
  }
};

// Create utility functions for accessing theme values
const createStyleUtils = theme => ({
  mx: value => css`margin-left: ${theme.spacing[value]}; margin-right: ${theme.spacing[value]};`,
  my: value => css`margin-top: ${theme.spacing[value]}; margin-bottom: ${theme.spacing[value]};`,
  px: value => css`padding-left: ${theme.spacing[value]}; padding-right: ${theme.spacing[value]};`,
  py: value => css`padding-top: ${theme.spacing[value]}; padding-bottom: ${theme.spacing[value]};`,
  typography: variant => {
    const variants = {
      h1: css`
        font-size: ${theme.typography.fontSize.xxl};
        font-weight: ${theme.typography.fontWeight.bold};
        line-height: ${theme.typography.lineHeight.tight};
      `,
      h2: css`
        font-size: ${theme.typography.fontSize.xl};
        font-weight: ${theme.typography.fontWeight.bold};
        line-height: ${theme.typography.lineHeight.tight};
      `,
      body1: css`
        font-size: ${theme.typography.fontSize.md};
        font-weight: ${theme.typography.fontWeight.normal};
        line-height: ${theme.typography.lineHeight.normal};
      `,
      body2: css`
        font-size: ${theme.typography.fontSize.sm};
        font-weight: ${theme.typography.fontWeight.normal};
        line-height: ${theme.typography.lineHeight.normal};
      `,
      caption: css`
        font-size: ${theme.typography.fontSize.xs};
        font-weight: ${theme.typography.fontWeight.normal};
        line-height: ${theme.typography.lineHeight.normal};
        color: ${theme.colors.text.light};
      `
    };
  
    return variants[variant];
  }
});

// Using the design system
function App() {
  const styleUtils = createStyleUtils(theme);
  
  return (
    <ThemeProvider theme={theme}>
      <div
        css={css`
          font-family: ${theme.typography.fontFamily};
          color: ${theme.colors.text.primary};
          background-color: ${theme.colors.background.light};
          ${styleUtils.px('lg')};
          ${styleUtils.py('xl')};
        `}
      >
        <h1 css={styleUtils.typography('h1')}>Design System Example</h1>
        <p css={styleUtils.typography('body1')}>
          This example demonstrates how to build a design system with Emotion.
        </p>
        <div
          css={css`
            ${styleUtils.my('lg')};
            padding: ${theme.spacing.md};
            border-radius: ${theme.borderRadius.md};
            background-color: ${theme.colors.background.dark};
            box-shadow: ${theme.shadows.sm};
          
            ${theme.breakpoints.md} {
              display: flex;
              justify-content: space-between;
            }
          `}
        >
          <div css={styleUtils.typography('body2')}>
            Responsive layout example
          </div>
          <div css={styleUtils.typography('caption')}>
            Resize the browser to see how it adapts
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
```

This example demonstrates:

1. Creating a comprehensive theme object with design tokens
2. Building utility functions to access theme values
3. Creating typography styles based on the theme
4. Using responsive breakpoints from the theme
5. Creating a responsive layout with the design system

### 2. Component Composition

Building complex UIs with composable components:

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

// Base card component
function Card({ children, elevated, ...props }) {
  return (
    <div
      css={css`
        padding: 16px;
        border-radius: 4px;
        background-color: white;
        ${elevated && 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);'}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Card header component
function CardHeader({ title, subtitle, ...props }) {
  return (
    <div
      css={css`
        padding-bottom: 12px;
        border-bottom: 1px solid #eee;
        margin-bottom: 16px;
      `}
      {...props}
    >
      <h3
        css={css`
          margin: 0 0 4px;
          font-size: 18px;
        `}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          css={css`
            margin: 0;
            color: #666;
            font-size: 14px;
          `}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Card content component
function CardContent({ children, ...props }) {
  return (
    <div
      css={css`
        font-size: 14px;
        line-height: 1.5;
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Card footer component
function CardFooter({ children, ...props }) {
  return (
    <div
      css={css`
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: flex-end;
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Usage example
function CardExample() {
  return (
    <Card elevated>
      <CardHeader
        title="Component Composition"
        subtitle="Building UIs with composable components"
      />
      <CardContent>
        <p>
          This example demonstrates how to build complex UIs using component
          composition with Emotion.
        </p>

<p>This example shows complex UIs through component composition.</p>
        <p>Each component is responsible for a specific part of the UI, making the code more maintainable and reusable.</p>
      </CardContent>
      <CardFooter>
        <button
          css={css`
            padding: 8px 16px;
            background-color: #0070f3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            
            &:hover {
              background-color: #0051cc;
            }
          `}
        >
          Learn More
        </button>
      </CardFooter>
    </Card>
  );
}
```

## Creating Reusable Styled Components

Let's look at how to create a reusable styled component system:

```jsx
import styled from '@emotion/styled';

// Create a Box component that accepts system props
const Box = styled.div`
  ${props => props.m && `margin: ${props.m}px;`}
  ${props => props.mx && `margin-left: ${props.mx}px; margin-right: ${props.mx}px;`}
  ${props => props.my && `margin-top: ${props.my}px; margin-bottom: ${props.my}px;`}
  ${props => props.p && `padding: ${props.p}px;`}
  ${props => props.px && `padding-left: ${props.px}px; padding-right: ${props.px}px;`}
  ${props => props.py && `padding-top: ${props.py}px; padding-bottom: ${props.py}px;`}
  ${props => props.width && `width: ${props.width};`}
  ${props => props.height && `height: ${props.height};`}
  ${props => props.bg && `background-color: ${props.bg};`}
  ${props => props.color && `color: ${props.color};`}
  ${props => props.display && `display: ${props.display};`}
  ${props => props.flexDirection && `flex-direction: ${props.flexDirection};`}
  ${props => props.justifyContent && `justify-content: ${props.justifyContent};`}
  ${props => props.alignItems && `align-items: ${props.alignItems};`}
`;

// Create a Flex component that extends Box
const Flex = styled(Box)`
  display: flex;
`;

// Create a Text component for typography
const Text = styled.p`
  margin: 0;
  ${props => props.size && `font-size: ${props.size}px;`}
  ${props => props.weight && `font-weight: ${props.weight};`}
  ${props => props.color && `color: ${props.color};`}
  ${props => props.align && `text-align: ${props.align};`}
`;

// Usage example
function StyledComponentExample() {
  return (
    <Box p={20} bg="#f5f5f5">
      <Text size={24} weight={700} mb={16}>
        Styled Component System
      </Text>
      <Flex flexDirection="column" bg="white" p={16} borderRadius={4}>
        <Text size={16} color="#666">
          Using a system of styled components makes it easy to maintain
          consistent spacing, typography, and colors throughout your application.
        </Text>
        <Flex mt={20} justifyContent="space-between">
          <Box bg="#e6f7ff" p={12} borderRadius={4}>Box 1</Box>
          <Box bg="#fff1e6" p={12} borderRadius={4}>Box 2</Box>
          <Box bg="#e6ffe6" p={12} borderRadius={4}>Box 3</Box>
        </Flex>
      </Flex>
    </Box>
  );
}
```

## Conclusion

Emotion provides a powerful system for CSS composition in React applications through:

> "Emotion brings the expressiveness of CSS and the composability of JavaScript together to create a styling approach that feels natural in React."

1. **Scoped styles**: Preventing unintended style leakage between components
2. **Dynamic styling**: Using props and state to dynamically generate styles
3. **Style composition**: Building complex styles by combining simpler ones
4. **Theme support**: Creating consistent design systems
5. **Performance optimizations**: Memoization and server-side rendering

By building from first principles of CSS composition, Emotion helps solve many of the challenges of styling in React applications, enabling developers to create maintainable, consistent, and dynamic UIs. Whether you're building a simple component or a comprehensive design system, Emotion's flexible API and powerful composition features make it an excellent choice for styling React applications.