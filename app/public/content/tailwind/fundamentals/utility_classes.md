# Tailwind CSS Core Utility Classes for Layout: Display, Width, and Height

When building layouts in Tailwind CSS, the display, width, and height utility classes form the foundation of how elements are positioned and sized on the page. Let's explore these core utility classes from first principles, seeing how they map to CSS properties and how they work together to create layouts.

## Display Utility Classes

The display property in CSS determines how an element is rendered in the layout flow. Tailwind provides utility classes that map directly to the CSS display values.

### Basic Display Values

```html
<div class="block"><!-- Block element --></div>
<span class="inline"><!-- Inline element --></span>
<div class="inline-block"><!-- Inline-block element --></div>
<div class="hidden"><!-- Hidden element (display: none) --></div>
```

Each of these classes maps to the corresponding CSS display property:

```css
.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }
.hidden { display: none; }
```

Let's understand what each does:

- **`block`**: Takes up the full width available, with line breaks before and after
- **`inline`**: Flows with text content, only takes up as much width as needed
- **`inline-block`**: Flows with text but can have width and height properties
- **`hidden`**: Removes the element from the layout (not rendered)

### Example: Different Display Types

Here's how different display values affect layout:

```html
<div class="border border-blue-500 p-2 mb-4">
  This is a <span class="block border border-red-500 p-1">block span</span> inside a div.
</div>

<div class="border border-blue-500 p-2 mb-4">
  This is an <span class="inline border border-red-500 p-1">inline span</span> inside a div.
</div>

<div class="border border-blue-500 p-2 mb-4">
  This is an <span class="inline-block border border-red-500 p-1">inline-block span</span> inside a div.
</div>
```

In this example:
- The `block` span will break to a new line and take full width
- The `inline` span will flow with the text and only be as wide as its content
- The `inline-block` span will flow with text but can have height/width properties

### Flex and Grid Display

Tailwind also provides classes for CSS Flexbox and Grid:

```html
<div class="flex"><!-- Flex container --></div>
<div class="inline-flex"><!-- Inline flex container --></div>
<div class="grid"><!-- Grid container --></div>
<div class="inline-grid"><!-- Inline grid container --></div>
```

These map to:

```css
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.grid { display: grid; }
.inline-grid { display: inline-grid; }
```

The difference between `flex` and `inline-flex` (or `grid` and `inline-grid`) is similar to the difference between `block` and `inline-block`:
- `flex` and `grid` are block-level containers
- `inline-flex` and `inline-grid` flow inline with surrounding content

### Example: Flex vs Inline-Flex

```html
<div class="mb-4">
  Before 
  <div class="flex bg-blue-100 p-2">
    <div class="p-2 bg-blue-500 text-white">Flex item 1</div>
    <div class="p-2 bg-blue-700 text-white">Flex item 2</div>
  </div>
  After
</div>

<div class="mb-4">
  Before 
  <div class="inline-flex bg-red-100 p-2">
    <div class="p-2 bg-red-500 text-white">Inline-flex item 1</div>
    <div class="p-2 bg-red-700 text-white">Inline-flex item 2</div>
  </div>
  After
</div>
```

The `flex` container will break to its own line (like a block element), while the `inline-flex` container will try to flow inline with the surrounding text.

### Table Display Values

Tailwind also supports table display modes:

```html
<div class="table"><!-- Table container --></div>
<div class="table-row"><!-- Table row --></div>
<div class="table-cell"><!-- Table cell --></div>
```

These are useful for creating table-like layouts without using actual `<table>` elements.

### Responsive Display Classes

Like most Tailwind utilities, display classes can be made responsive with breakpoint prefixes:

```html
<div class="hidden md:block">
  <!-- Hidden on mobile, displayed as block on medium (md) screens and above -->
</div>

<div class="block lg:hidden">
  <!-- Visible by default, hidden on large (lg) screens and above -->
</div>
```

This makes it easy to change how elements are displayed at different screen sizes—perfect for responsive designs where you might want to show or hide elements based on screen size.

## Width Utility Classes

Width utilities in Tailwind control how wide an element is. They range from fixed widths to percentages and other responsive options.

### Fixed Widths

```html
<div class="w-1"><!-- 0.25rem (4px by default) --></div>
<div class="w-2"><!-- 0.5rem (8px) --></div>
<div class="w-4"><!-- 1rem (16px) --></div>
<div class="w-8"><!-- 2rem (32px) --></div>
<div class="w-16"><!-- 4rem (64px) --></div>
<div class="w-32"><!-- 8rem (128px) --></div>
<div class="w-64"><!-- 16rem (256px) --></div>
```

These fixed width classes follow Tailwind's spacing scale, where each increment represents a specific rem value.

### Percentage-Based Widths

```html
<div class="w-1/2"><!-- 50% width --></div>
<div class="w-1/3"><!-- 33.333% width --></div>
<div class="w-2/3"><!-- 66.666% width --></div>
<div class="w-1/4"><!-- 25% width --></div>
<div class="w-3/4"><!-- 75% width --></div>
<div class="w-1/5"><!-- 20% width --></div>
<!-- ...and many more fraction options -->
```

Fraction-based width classes are perfect for creating columns and grid-like layouts.

### Special Width Values

```html
<div class="w-full"><!-- 100% width --></div>
<div class="w-screen"><!-- 100vw (viewport width) --></div>
<div class="w-min"><!-- min-content --></div>
<div class="w-max"><!-- max-content --></div>
<div class="w-fit"><!-- fit-content --></div>
<div class="w-auto"><!-- auto width --></div>
```

These special width values serve specific purposes:
- `w-full`: Takes up 100% of the parent container's width
- `w-screen`: Takes up the full viewport width (can overflow the parent)
- `w-min`: Sizes to the minimum content width
- `w-max`: Sizes to the maximum content width
- `w-fit`: Similar to fit-content
- `w-auto`: Default auto sizing

### Example: Using Different Width Classes

Let's see how these width classes affect layout:

```html
<div class="space-y-4">
  <div class="w-full bg-blue-200 p-2">w-full (100% width)</div>
  
  <div class="w-1/2 bg-blue-300 p-2">w-1/2 (50% width)</div>
  
  <div class="w-64 bg-blue-400 p-2">w-64 (16rem / 256px)</div>
  
  <div class="w-auto bg-blue-500 p-2 inline-block">
    w-auto (only as wide as content)
  </div>
  
  <div class="flex space-x-4">
    <div class="w-1/3 bg-green-300 p-2">w-1/3</div>
    <div class="w-2/3 bg-green-500 p-2">w-2/3</div>
  </div>
</div>
```

In this example:
- `w-full` takes the entire width
- `w-1/2` takes half the width
- `w-64` is fixed at 16rem (256px by default)
- `w-auto` sizes to its content
- The last two divs show a 1/3 and 2/3 split using fractions

### Min and Max Width

Tailwind also provides min-width and max-width utilities:

```html
<div class="min-w-0"><!-- min-width: 0px --></div>
<div class="min-w-full"><!-- min-width: 100% --></div>
<div class="min-w-min"><!-- min-width: min-content --></div>
<div class="min-w-max"><!-- min-width: max-content --></div>

<div class="max-w-none"><!-- max-width: none --></div>
<div class="max-w-xs"><!-- max-width: 20rem (320px) --></div>
<div class="max-w-sm"><!-- max-width: 24rem (384px) --></div>
<div class="max-w-md"><!-- max-width: 28rem (448px) --></div>
<div class="max-w-lg"><!-- max-width: 32rem (512px) --></div>
<div class="max-w-xl"><!-- max-width: 36rem (576px) --></div>
<div class="max-w-2xl"><!-- max-width: 42rem (672px) --></div>
<div class="max-w-full"><!-- max-width: 100% --></div>
<div class="max-w-screen-sm"><!-- max-width: 640px --></div>
<div class="max-w-screen-md"><!-- max-width: 768px --></div>
<div class="max-w-screen-lg"><!-- max-width: 1024px --></div>
<div class="max-w-screen-xl"><!-- max-width: 1280px --></div>
<div class="max-w-screen-2xl"><!-- max-width: 1536px --></div>
```

The `max-w-{size}` utilities are especially useful for limiting content width for readability, like constraining article text to `max-w-prose` (65 characters).

### Example: Using Max Width

```html
<div class="mx-auto max-w-md bg-gray-100 p-4">
  <p>This container has max-w-md (28rem) and mx-auto to center it.</p>
  <p>It's perfect for forms, cards, and other narrow content.</p>
</div>

<div class="mx-auto max-w-prose bg-blue-100 p-4 mt-4">
  <p>This container has max-w-prose, which is optimized for readability.</p>
  <p>It's ideal for article content, blog posts, and other text-heavy sections.</p>
</div>
```

The `max-w-md` example creates a medium-sized container, while `max-w-prose` creates a container that's optimized for reading text content.

## Height Utility Classes

Height utilities work very similarly to width utilities, with a few differences to account for the unique nature of vertical sizing on the web.

### Fixed Heights

```html
<div class="h-0"><!-- 0px height --></div>
<div class="h-1"><!-- 0.25rem (4px) --></div>
<div class="h-2"><!-- 0.5rem (8px) --></div>
<div class="h-4"><!-- 1rem (16px) --></div>
<div class="h-8"><!-- 2rem (32px) --></div>
<div class="h-16"><!-- 4rem (64px) --></div>
<div class="h-32"><!-- 8rem (128px) --></div>
<div class="h-64"><!-- 16rem (256px) --></div>
```

Like width, these follow Tailwind's spacing scale.

### Special Height Values

```html
<div class="h-auto"><!-- auto height --></div>
<div class="h-full"><!-- 100% height --></div>
<div class="h-screen"><!-- 100vh (viewport height) --></div>
<div class="h-min"><!-- min-content --></div>
<div class="h-max"><!-- max-content --></div>
<div class="h-fit"><!-- fit-content --></div>
```

These special values serve specific purposes:
- `h-auto`: Default auto sizing based on content
- `h-full`: 100% of parent container height (parent must have a defined height)
- `h-screen`: 100% of viewport height
- `h-min`, `h-max`, `h-fit`: Content-based sizing

### Example: Using Height Classes

```html
<div class="flex space-x-4">
  <div class="h-16 w-16 bg-purple-300 flex items-center justify-center">
    h-16
  </div>
  
  <div class="h-32 w-16 bg-purple-400 flex items-center justify-center">
    h-32
  </div>
  
  <div class="h-64 w-16 bg-purple-500 flex items-center justify-center">
    h-64
  </div>
</div>

<div class="h-screen bg-green-100 mt-4 p-4">
  This div takes up the full viewport height (h-screen)
</div>
```

### Min and Max Height

Similar to width, Tailwind provides min-height and max-height utilities:

```html
<div class="min-h-0"><!-- min-height: 0px --></div>
<div class="min-h-full"><!-- min-height: 100% --></div>
<div class="min-h-screen"><!-- min-height: 100vh --></div>
<div class="min-h-min"><!-- min-height: min-content --></div>
<div class="min-h-max"><!-- min-height: max-content --></div>
<div class="min-h-fit"><!-- min-height: fit-content --></div>

<div class="max-h-full"><!-- max-height: 100% --></div>
<div class="max-h-screen"><!-- max-height: 100vh --></div>
<div class="max-h-min"><!-- max-height: min-content --></div>
<div class="max-h-max"><!-- max-height: max-content --></div>
<div class="max-h-fit"><!-- max-height: fit-content --></div>
<div class="max-h-0"><!-- max-height: 0px --></div>
<div class="max-h-px"><!-- max-height: 1px --></div>
<!-- And numeric values: max-h-1, max-h-2, etc. -->
```

### Use Case: Creating Fixed-Height Containers

One common use case is creating scrollable containers with fixed heights:

```html
<div class="max-h-64 overflow-y-auto p-4 bg-gray-100 border">
  <p>This is a scrollable container with max-h-64.</p>
  <p>Content that exceeds this height will be scrollable.</p>
  <!-- Imagine more content here -->
  <p>If there's enough content, a scrollbar will appear.</p>
</div>
```

The `max-h-64` sets a maximum height of 16rem (256px), and `overflow-y-auto` adds a scrollbar when the content exceeds this height.

## Combining Display, Width, and Height

The real power comes when you combine these layout utilities to create sophisticated designs.

### Example 1: Card Layout

```html
<div class="flex flex-wrap gap-4">
  <!-- Card 1 -->
  <div class="w-64 h-auto bg-white rounded-lg shadow-md overflow-hidden">
    <div class="h-48 bg-blue-500"></div>
    <div class="p-4">
      <h3 class="font-bold">Card Title</h3>
      <p class="text-sm">Card description goes here...</p>
    </div>
  </div>
  
  <!-- Card 2 -->
  <div class="w-64 h-auto bg-white rounded-lg shadow-md overflow-hidden">
    <div class="h-48 bg-green-500"></div>
    <div class="p-4">
      <h3 class="font-bold">Another Card</h3>
      <p class="text-sm">More description text...</p>
    </div>
  </div>
</div>
```

In this example:
- `flex flex-wrap` creates a flexible container that wraps cards to new lines when needed
- Each card has `w-64` to set a fixed width
- The image section uses `h-48` for a consistent height
- The entire card uses `h-auto` to size based on content

### Example 2: Full-Page Layout

```html
<div class="h-screen flex flex-col">
  <!-- Header -->
  <header class="h-16 bg-blue-600 text-white flex items-center px-4">
    <h1 class="text-xl font-bold">Website Title</h1>
  </header>
  
  <!-- Main Content Area -->
  <main class="flex flex-1 overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-100 p-4 overflow-y-auto hidden md:block">
      Sidebar content
    </aside>
    
    <!-- Content -->
    <div class="flex-1 p-4 overflow-y-auto">
      <h2 class="text-2xl font-bold mb-4">Main Content</h2>
      <p>Content goes here...</p>
    </div>
  </main>
  
  <!-- Footer -->
  <footer class="h-12 bg-gray-800 text-white flex items-center justify-center">
    Footer content
  </footer>
</div>
```

In this layout:
- `h-screen` makes the container fill the viewport height
- `flex flex-col` stacks the header, main area, and footer vertically
- `h-16` and `h-12` set fixed heights for the header and footer
- `flex-1` on the main area makes it take up all remaining space
- `w-64` sets a fixed width for the sidebar
- `hidden md:block` hides the sidebar on mobile screens, showing it only on medium-sized screens and above
- `overflow-y-auto` adds scrollbars when content exceeds available space

### Example 3: Grid Layout with Responsive Widths

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div class="h-32 bg-red-200 flex items-center justify-center">Item 1</div>
  <div class="h-32 bg-blue-200 flex items-center justify-center">Item 2</div>
  <div class="h-32 bg-green-200 flex items-center justify-center">Item 3</div>
  <div class="h-32 bg-yellow-200 flex items-center justify-center">Item 4</div>
</div>
```

This example creates a responsive grid that:
- Shows 1 column on mobile (default)
- Shows 2 columns on small screens and up
- Shows 4 columns on large screens and up
- Each item has a fixed height (`h-32`)

## Practical Tips and Best Practices

### 1. Default to `w-auto` and `h-auto`

Only specify widths and heights when necessary. Many elements work best with their natural sizing:

```html
<!-- Let paragraphs be their natural height -->
<p class="w-full h-auto">This paragraph will size naturally in height.</p>
```

### 2. Use Responsive Classes Strategically

```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Full width on mobile, half width on medium screens, one-third on large screens -->
</div>
```

### 3. Combine with Other Layout Utilities

Display, width, and height classes work best when combined with other layout utilities:

```html
<div class="flex items-center justify-center h-screen bg-gray-100">
  <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
    <!-- Centered card with maximum width -->
  </div>
</div>
```

### 4. Use Min/Max for Flexible Layouts

Instead of fixed widths or heights, use min/max constraints for more flexible layouts:

```html
<div class="min-h-screen max-w-4xl mx-auto p-4">
  <!-- Content that's at least the height of the viewport, 
       but can grow, and has a maximum width with centered margin -->
</div>
```

### 5. Remember Container Relationships

Height percentages (`h-full`) only work if the parent has a defined height:

```html
<!-- This won't work as expected -->
<div>
  <div class="h-full bg-blue-500">I won't be full height because my parent has no height</div>
</div>

<!-- This works -->
<div class="h-64">
  <div class="h-full bg-blue-500">I'll be 64 (16rem) in height</div>
</div>
```

## Common Layout Patterns

### Centering Content

```html
<!-- Horizontal centering with max-width -->
<div class="max-w-md mx-auto p-4">
  Horizontally centered with maximum width
</div>

<!-- Perfect centering (horizontal and vertical) -->
<div class="flex items-center justify-center h-screen">
  <div class="p-8 bg-white rounded shadow-md">
    Perfectly centered in the viewport
  </div>
</div>
```

### Sticky Header

```html
<header class="sticky top-0 h-16 bg-white shadow z-10 flex items-center px-4">
  Sticky Header
</header>
<main class="p-4">
  <!-- Content that scrolls underneath the sticky header -->
  <p>Content goes here...</p>
</main>
```

### Sidebar Layout

```html
<div class="flex min-h-screen">
  <!-- Sidebar -->
  <aside class="w-64 bg-gray-800 text-white p-4">
    Sidebar content
  </aside>
  
  <!-- Main content -->
  <main class="flex-1 p-4 bg-gray-100">
    Main content
  </main>
</div>
```

### Fixed-Height Scrollable Section

```html
<div class="h-64 overflow-y-auto bg-gray-100 p-4">
  <div class="space-y-4">
    <p>Scrollable content section...</p>
    <!-- More content -->
  </div>
</div>
```

## Using Layout Classes with JavaScript

You can dynamically control layout with JavaScript by adding or removing Tailwind classes:

```javascript
// Toggle sidebar visibility
const toggleSidebar = () => {
  const sidebar = document.getElementById('sidebar');
  
  if (sidebar.classList.contains('hidden')) {
    sidebar.classList.remove('hidden');
    sidebar.classList.add('w-64');
  } else {
    sidebar.classList.add('hidden');
    sidebar.classList.remove('w-64');
  }
};

// Example button click handler
document.getElementById('toggle-button').addEventListener('click', toggleSidebar);
```

## Conclusion

Tailwind's display, width, and height utility classes form the foundation of layout in Tailwind CSS. By understanding how these utilities work, both individually and together, you can create complex, responsive layouts with minimal custom CSS.

The key principles to remember:

1. **Display classes** control how elements are positioned in the document flow (block, inline, flex, grid, etc.)
2. **Width classes** control horizontal sizing, with options for fixed widths, percentages, and content-based sizing
3. **Height classes** control vertical sizing, including viewport-relative and content-based options
4. These utilities are most powerful when combined with other Tailwind utilities like padding, margin, flex, and grid

By mastering these core layout utilities, you'll have a solid foundation for building almost any layout in Tailwind CSS. The utility-first approach gives you the flexibility to create complex designs directly in your HTML, without writing custom CSS for layout purposes.