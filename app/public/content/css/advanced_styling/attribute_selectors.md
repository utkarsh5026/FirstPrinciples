# CSS Attribute Selectors: From First Principles

Attribute selectors are among the most powerful yet underutilized features in CSS. They allow us to target HTML elements based on their attributes and attribute values, providing precise control without requiring additional classes or IDs. Let's explore attribute selectors from first principles, understanding how they work, their variations, and practical applications.

## Understanding HTML Attributes: The Foundation

Before diving into attribute selectors, let's understand what HTML attributes are. Attributes provide additional information about HTML elements and are always specified in the start tag. They typically come in name/value pairs like `name="value"`.

Common HTML attributes include:

```html
<a href="https://example.com" title="Visit Example" target="_blank">Example Link</a>
<img src="image.jpg" alt="Description" width="300" height="200">
<input type="text" disabled placeholder="Enter your name">
<div data-category="sports" class="card" id="sports-card">Sports News</div>
```

In these examples, `href`, `title`, `target`, `src`, `alt`, `width`, `height`, `type`, `disabled`, `placeholder`, `data-category`, `class`, and `id` are all attributes. Each carries information that either:

* Affects how the element behaves (`href`, `type`, `disabled`)
* Provides additional information (`alt`, `title`)
* Identifies the element (`class`, `id`)
* Stores custom data (`data-category`)

Attribute selectors allow us to target elements based on these attributes, creating powerful and precise selectors.

## The Basic Attribute Selector [attr]

The most basic form of attribute selector simply checks for the presence of an attribute, regardless of its value:

```css
/* Selects all elements that have a title attribute */
[title] {
    cursor: help;
    border-bottom: 1px dotted #999;
}

/* Selects all elements with a disabled attribute */
[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Selects all elements with a required attribute */
[required] {
    border-left: 4px solid #c00;
}
```

When applied to HTML like this:

```html
<p title="Additional information">This paragraph has a title attribute.</p>
<p>This paragraph does not have a title attribute.</p>
<input type="text" disabled>
<input type="text" required>
```

The CSS would:

1. Add a dotted underline and 'help' cursor to the first paragraph
2. Make the disabled input appear faded and change the cursor
3. Add a red left border to the required input

This basic selector is particularly useful for styling form elements based on their state or for adding visual cues to elements with specific attributes.

## Exact Match Attribute Selector [attr="value"]

To select elements with a specific attribute value, we use the exact match attribute selector:

```css
/* Selects all elements where type="text" */
[type="text"] {
    padding: 8px;
    border: 1px solid #ddd;
}

/* Selects all checkbox inputs */
[type="checkbox"] {
    margin-right: 5px;
}

/* Selects all elements with target="_blank" */
[target="_blank"] {
    color: #0066cc;
    padding-right: 20px;
    background: url('external-link.svg') no-repeat right center;
    background-size: 16px;
}
```

This allows for very specific targeting of elements based on their exact attribute values:

```html
<input type="text" placeholder="Text input"> <!-- Gets padding and border -->
<input type="checkbox"> <!-- Gets margin -->
<input type="radio"> <!-- Not affected by either rule -->
<a href="https://example.com" target="_blank">External Link</a> <!-- Gets the external link style -->
```

The exact match selector is powerful because it lets us style elements based on their functionality (like input types) without needing to add extra classes.

## String-Manipulation Attribute Selectors

CSS provides several selectors for matching parts of attribute values, which is incredibly useful for attributes that may contain multiple values or follow specific patterns.

### Substring Match [attr*="value"]

This selector matches if the attribute value contains the specified substring anywhere:

```css
/* Selects elements where the title contains "info" anywhere */
[title*="info"] {
    background-color: #e8f4ff;
}

/* Selects elements where the href contains "example.com" anywhere */
[href*="example.com"] {
    color: purple;
}

/* Selects elements where the src contains "thumbnail" anywhere */
[src*="thumbnail"] {
    border: 2px solid #ddd;
}
```

This is useful when you need to match part of an attribute value:

```html
<a title="More information">Info link</a> <!-- Selected -->
<a title="Additional info here">Another link</a> <!-- Selected -->
<a title="Help page">Help link</a> <!-- Not selected -->

<a href="https://example.com/page">Example domain</a> <!-- Selected -->
<a href="https://sub.example.com">Example subdomain</a> <!-- Selected -->
<a href="https://othersite.com">Other site</a> <!-- Not selected -->

<img src="images/thumbnail-01.jpg"> <!-- Selected -->
<img src="images/profile-thumbnail.png"> <!-- Selected -->
<img src="images/header.jpg"> <!-- Not selected -->
```

The substring match is great for targeting elements with similar patterns in their attributes, regardless of where the pattern appears.

### Starts-With Match [attr^="value"]

This selector matches if the attribute value begins with the specified string:

```css
/* Selects links that start with "https" */
[href^="https"] {
    color: green; /* Secure links */
}

/* Selects links that start with "mailto:" */
[href^="mailto:"] {
    padding-left: 20px;
    background: url('email-icon.svg') no-repeat left center;
}

/* Selects images that start with "icons/" */
[src^="icons/"] {
    width: 24px;
    height: 24px;
    vertical-align: middle;
}
```

This is particularly useful for categorizing elements based on their attribute value patterns:

```html
<a href="https://example.com">Secure link</a> <!-- Selected, colored green -->
<a href="http://example.com">Non-secure link</a> <!-- Not selected -->

<a href="mailto:info@example.com">Email us</a> <!-- Selected, gets icon -->
<a href="tel:+1234567890">Call us</a> <!-- Not selected -->

<img src="icons/user.svg"> <!-- Selected, sized appropriately -->
<img src="photos/landscape.jpg"> <!-- Not selected -->
```

The starts-with selector is excellent for styling elements based on categories indicated by their attribute value prefixes.

### Ends-With Match [attr$="value"]

This selector matches if the attribute value ends with the specified string:

```css
/* Selects links to PDF files */
[href$=".pdf"] {
    padding-right: 20px;
    background: url('pdf-icon.svg') no-repeat right center;
}

/* Selects images that are JPGs */
[src$=".jpg"], [src$=".jpeg"] {
    border: 1px solid #eee;
}

/* Selects elements with class names ending in "-button" */
[class$="-button"] {
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 4px;
}
```

This is particularly useful for styling elements based on file types or naming conventions:

```html
<a href="document.pdf">PDF Document</a> <!-- Selected, gets icon -->
<a href="spreadsheet.xlsx">Excel Spreadsheet</a> <!-- Not selected -->

<img src="photo.jpg"> <!-- Selected, gets border -->
<img src="icon.svg"> <!-- Not selected -->

<div class="submit-button">Submit</div> <!-- Selected, gets button styling -->
<div class="card-header">Header</div> <!-- Not selected -->
```

The ends-with selector is perfect for targeting resources based on their file extensions or elements that follow specific naming patterns.

### Word Match [attr~="value"]

This selector matches if the attribute value contains the specified word as a whole word (surrounded by spaces):

```css
/* Selects elements with class="card" or class="card item" etc. */
[class~="card"] {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 16px;
}

/* Selects elements with rel="nofollow" */
[rel~="nofollow"] {
    color: #999;
}

/* Selects elements with title containing the word "tooltip" */
[title~="tooltip"] {
    position: relative;
    cursor: help;
}
```

This is particularly useful for attributes that contain space-separated lists of values:

```html
<div class="card">Simple card</div> <!-- Selected -->
<div class="card highlight">Highlighted card</div> <!-- Selected -->
<div class="user-card">User card</div> <!-- Not selected (no space before/after "card") -->

<a href="#" rel="nofollow">Link</a> <!-- Selected -->
<a href="#" rel="nofollow noopener">External link</a> <!-- Selected -->
<a href="#">Normal link</a> <!-- Not selected -->

<span title="This is a tooltip">Hover me</span> <!-- Selected -->
<span title="tooltip information">Also hover me</span> <!-- Selected -->
<span title="tooltipInfo">Not a tooltip word</span> <!-- Not selected -->
```

The word match is especially useful for targeting elements based on class names or other space-separated attribute values, ensuring you only match complete words.

### Hyphen-Separated Match [attr|="value"]

This selector matches if the attribute value is exactly equal to the specified value, or starts with the specified value followed by a hyphen (-):

```css
/* Selects elements with lang="en" or lang="en-US", but not lang="english" */
[lang|="en"] {
    font-family: 'Times New Roman', serif;
}

/* Selects elements with data-type="button" or data-type="button-primary" */
[data-type|="button"] {
    cursor: pointer;
    user-select: none;
}
```

This is particularly useful for targeting language variants or prefixed values:

```html
<p lang="en">English text</p> <!-- Selected -->
<p lang="en-US">US English text</p> <!-- Selected -->
<p lang="en-GB">British English text</p> <!-- Selected -->
<p lang="fr">French text</p> <!-- Not selected -->
<p lang="english">English word</p> <!-- Not selected (no hyphen) -->

<button data-type="button">Basic Button</button> <!-- Selected -->
<button data-type="button-primary">Primary Button</button> <!-- Selected -->
<button data-type="button_secondary">Secondary Button</button> <!-- Not selected (underscore, not hyphen) -->
<button data-type="submit">Submit Button</button> <!-- Not selected -->
```

The hyphen-separated match is specifically designed for attributes that use language codes (like `lang`) or component hierarchies with hyphen separators.

## Case-Sensitivity in Attribute Selectors

By default, attribute selectors are case-sensitive. CSS3 introduced the `i` flag (insensitive) to make them case-insensitive:

```css
/* Case-sensitive match (default behavior) */
[title="hello"] {
    color: blue;
}

/* Case-insensitive match */
[title="hello" i] {
    border: 1px solid red;
}
```

In this example:

```html
<p title="hello">Blue and red border</p> <!-- Matches both selectors -->
<p title="Hello">Red border only</p> <!-- Matches only the case-insensitive selector -->
<p title="HELLO">Red border only</p> <!-- Matches only the case-insensitive selector -->
```

The `i` flag is particularly useful when working with attributes like `href` and `src` where case might vary but shouldn't affect your styling.

## Combining Attribute Selectors with Other Selectors

Attribute selectors can be combined with other CSS selectors to create highly specific targeting rules:

```css
/* Only <a> elements with download attributes */
a[download] {
    font-weight: bold;
}

/* Input elements of type text with required attribute */
input[type="text"][required] {
    border-color: #f00;
}

/* Links with class "button" that open in new tabs */
a.button[target="_blank"] {
    padding-right: 24px;
    background: url('new-tab-icon.svg') no-repeat right center;
}

/* All divs with data attributes that start with "section-" */
div[class^="section-"] {
    margin-bottom: 20px;
}
```

When applied to HTML:

```html
<a href="file.zip" download>Download file</a> <!-- Bold -->
<a href="page.html">View page</a> <!-- Not bold -->

<input type="text" required> <!-- Red border -->
<input type="text"> <!-- Normal border -->
<input type="checkbox" required> <!-- Not affected -->

<a href="#" class="button" target="_blank">Open in new tab</a> <!-- Gets icon -->
<a href="#" class="button">Normal button</a> <!-- No icon -->

<div class="section-intro">Introduction</div> <!-- Gets margin -->
<div class="section-content">Content</div> <!-- Gets margin -->
<div class="content-section">Different naming</div> <!-- No margin -->
```

These combinations allow for extremely precise targeting without requiring additional classes or IDs.

## Chaining Multiple Attribute Selectors

You can chain multiple attribute selectors to create even more specific selectors:

```css
/* Inputs that are both required and disabled */
[required][disabled] {
    background-color: #f5f5f5;
    border-color: #ddd;
}

/* Links to external secure sites */
[href^="https"][target="_blank"] {
    color: green;
}

/* Images that are SVGs and have a specific class */
[src$=".svg"][class*="icon"] {
    width: 24px;
    height: 24px;
}
```

This allows for targeting very specific combinations:

```html
<input type="text" required disabled> <!-- Selected -->
<input type="text" required> <!-- Not selected -->
<input type="text" disabled> <!-- Not selected -->

<a href="https://example.com" target="_blank">External secure site</a> <!-- Selected -->
<a href="https://example.com">Secure site (same tab)</a> <!-- Not selected -->
<a href="http://example.com" target="_blank">External non-secure site</a> <!-- Not selected -->

<img src="icon.svg" class="nav-icon"> <!-- Selected -->
<img src="icon.png" class="nav-icon"> <!-- Not selected -->
<img src="icon.svg" class="logo"> <!-- Not selected -->
```

Chaining attribute selectors creates highly specific selectors without relying on complex class naming conventions.

## Real-World Uses for Attribute Selectors

Let's explore some practical applications of attribute selectors in real-world web development.

### Form Styling

Attribute selectors are particularly powerful for styling forms:

```css
/* Style different input types */
input[type="text"],
input[type="email"],
input[type="password"],
input[type="search"] {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

input[type="checkbox"],
input[type="radio"] {
    margin-right: 8px;
}

/* Style inputs based on validation state */
input:not([type="submit"]):valid {
    border-color: green;
}

input:not([type="submit"]):invalid {
    border-color: red;
}

/* Style required fields */
input[required]::placeholder {
    color: #c00;
}

label[for]:has(+ input[required])::after {
    content: " *";
    color: #c00;
}

/* Style read-only inputs */
input[readonly] {
    background-color: #f5f5f5;
    cursor: default;
}

/* Style specific placeholders */
input[placeholder*="search" i] {
    background-image: url('search-icon.svg');
    background-position: 8px center;
    background-repeat: no-repeat;
    padding-left: 32px;
}
```

This allows for comprehensive form styling without needing to add classes to each input element.

### Link Styling Based on Destination

Attribute selectors are perfect for styling links based on their destination:

```css
/* External links */
a[href^="http"] {
    color: #0066cc;
}

/* Secure external links */
a[href^="https"] {
    color: #00994d;
}

/* File type indicators */
a[href$=".pdf"]::after {
    content: " (PDF)";
    font-size: 0.8em;
}

a[href$=".doc"]::after,
a[href$=".docx"]::after {
    content: " (Word)";
    font-size: 0.8em;
}

a[href$=".xls"]::after,
a[href$=".xlsx"]::after {
    content: " (Excel)";
    font-size: 0.8em;
}

/* Email links */
a[href^="mailto:"] {
    color: #cc6600;
    padding-left: 20px;
    background: url('email-icon.svg') no-repeat left center;
}

/* Phone links */
a[href^="tel:"] {
    color: #990000;
    padding-left: 20px;
    background: url('phone-icon.svg') no-repeat left center;
}

/* Social media links */
a[href*="twitter.com"],
a[href*="t.co"] {
    padding-left: 24px;
    background: url('twitter-icon.svg') no-repeat left center;
}

a[href*="facebook.com"],
a[href*="fb.com"] {
    padding-left: 24px;
    background: url('facebook-icon.svg') no-repeat left center;
}

a[href*="linkedin.com"] {
    padding-left: 24px;
    background: url('linkedin-icon.svg') no-repeat left center;
}
```

This automatically styles links based on their URL patterns, adding appropriate icons and visual cues without manual class assignment.

### Working with Data Attributes

HTML5 data attributes (`data-*`) are perfect for use with attribute selectors:

```css
/* Elements with specific categories */
[data-category="news"] {
    border-left: 4px solid #0066cc;
}

[data-category="sports"] {
    border-left: 4px solid #cc0000;
}

[data-category="technology"] {
    border-left: 4px solid #00cc66;
}

/* Elements with specific states */
[data-state="active"] {
    background-color: #eaf7ff;
}

[data-state="disabled"] {
    opacity: 0.5;
    pointer-events: none;
}

[data-state="loading"] {
    position: relative;
    min-height: 100px;
    background: url('loading-spinner.svg') no-repeat center center;
}

/* Elements with specific visibility settings */
[data-visible="false"] {
    display: none;
}

/* Elements with specific animation settings */
[data-animation="fade"] {
    transition: opacity 0.3s ease;
}

[data-animation="slide"] {
    transition: transform 0.3s ease;
}

/* Targeting elements with multiple data attributes */
[data-type="button"][data-size="large"] {
    padding: 12px 24px;
    font-size: 1.2em;
}

[data-type="button"][data-size="small"] {
    padding: 4px 8px;
    font-size: 0.8em;
}
```

Data attributes combined with attribute selectors provide a powerful way to implement component variations and states without complex class naming systems.

### Responsive Design with Attribute Selectors

Attribute selectors can be combined with media queries for responsive designs:

```css
/* Default styling */
img {
    max-width: 100%;
    height: auto;
}

/* Target specific image types on smaller screens */
@media (max-width: 768px) {
    img[src*="banner"] {
        display: none; /* Hide banners on mobile */
    }
  
    img[src*="logo"] {
        max-width: 200px; /* Limit logo size on mobile */
    }
  
    img[alt*="decorative" i] {
        display: none; /* Hide decorative images on mobile */
    }
}

/* Adjust form layout on smaller screens */
@media (max-width: 480px) {
    input:not([type="checkbox"]):not([type="radio"]) {
        width: 100%; /* Full width inputs on mobile */
    }
  
    [data-priority="low"] {
        display: none; /* Hide low-priority elements on mobile */
    }
}
```

This allows for responsive adjustments based on element attributes, creating more flexible responsive designs.

### Language-Specific Styling

The `lang` attribute is perfect for language-specific styling:

```css
/* Basic language-specific font families */
[lang|="en"] {
    font-family: 'Georgia', serif;
}

[lang|="ja"] {
    font-family: 'Hiragino Sans', sans-serif;
}

[lang|="ar"] {
    font-family: 'Amiri', serif;
    direction: rtl;
}

/* Language-specific quotation marks */
[lang|="en"] blockquote::before {
    content: open-quote;
}

[lang|="fr"] blockquote::before {
    content: "« ";
}

[lang|="de"] blockquote::before {
    content: "„";
}

/* Language-specific spacing */
[lang|="ja"] p,
[lang|="zh"] p {
    line-height: 1.7; /* More space for East Asian languages */
}
```

This allows for automatic application of language-appropriate styling without requiring additional classes.

### Working with SVG Elements

Attribute selectors are particularly useful for working with SVG elements:

```css
/* Select specific SVG element types */
svg[width="24"] {
    vertical-align: middle;
}

/* Target specific paths by their properties */
svg path[fill="#000000"] {
    fill: currentColor; /* Make black paths inherit text color */
}

/* Target elements with specific roles */
svg [role="presentation"] {
    pointer-events: none; /* Prevent interaction with decorative elements */
}

/* Target elements with specific IDs */
svg [id*="icon"] {
    transform-origin: center;
    transition: transform 0.3s ease;
}

svg:hover [id*="icon"] {
    transform: scale(1.1);
}
```

This allows for dynamic styling of SVG elements without modifying the SVG source files.

## Practical Example: Building a Complete Component

Let's build a card component that uses attribute selectors extensively:

```css
/* Base card styling */
.card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    padding: 16px;
}

/* Card variants based on data attributes */
.card[data-variant="primary"] {
    border-color: #0066cc;
    background-color: #f0f7ff;
}

.card[data-variant="success"] {
    border-color: #00cc66;
    background-color: #f0fff7;
}

.card[data-variant="warning"] {
    border-color: #ffcc00;
    background-color: #fffdf0;
}

.card[data-variant="danger"] {
    border-color: #cc0000;
    background-color: #fff0f0;
}

/* Card sizes */
.card[data-size="small"] {
    padding: 8px;
    font-size: 0.9em;
}

.card[data-size="large"] {
    padding: 24px;
    font-size: 1.1em;
}

/* Cards with images */
.card:has(img) {
    padding-top: 0;
}

.card > img {
    width: 100%;
    margin: 0 -16px;
    margin-bottom: 16px;
    display: block;
}

/* Cards with different content types */
.card:has([data-type="article"]) {
    max-width: 700px;
    line-height: 1.6;
}

.card:has([data-type="product"]) {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 16px;
    align-items: center;
}

/* Interactive cards */
.card[data-interactive="true"] {
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card[data-interactive="true"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Disabled cards */
.card[data-disabled="true"] {
    opacity: 0.7;
    pointer-events: none;
    background-color: #f5f5f5;
}

/* Loading state */
.card[data-loading="true"] {
    position: relative;
    min-height: 100px;
}

.card[data-loading="true"]::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7) url('loading-spinner.svg') no-repeat center center;
}

/* Card with specific content */
.card:has(form) {
    padding: 24px;
}

.card:has(table) {
    padding: 0;
    overflow: auto;
}

/* Card links styling */
.card a[href^="http"] {
    color: #0066cc;
    text-decoration: none;
    padding-right: 20px;
    background: url('external-link.svg') no-repeat right center;
    background-size: 16px;
}

.card a[href^="mailto:"] {
    color: #cc6600;
    text-decoration: none;
    padding-left: 20px;
    background: url('email-icon.svg') no-repeat left center;
    background-size: 16px;
}
```

This card component can be used with simple HTML like:

```html
<!-- Basic card -->
<div class="card">
    <h3>Basic Card</h3>
    <p>This is a standard card with no special attributes.</p>
</div>

<!-- Primary variant, large size, interactive card -->
<div class="card" data-variant="primary" data-size="large" data-interactive="true">
    <h3>Interactive Primary Card</h3>
    <p>This card is larger, has a primary style, and is interactive (hover me).</p>
</div>

<!-- Card with image -->
<div class="card">
    <img src="image.jpg" alt="Card image">
    <h3>Card with Image</h3>
    <p>This card has an image at the top.</p>
</div>

<!-- Disabled card -->
<div class="card" data-disabled="true">
    <h3>Disabled Card</h3>
    <p>This card is currently disabled.</p>
</div>

<!-- Loading card -->
<div class="card" data-loading="true">
    <h3>Loading Content</h3>
    <p>This card is in a loading state.</p>
</div>

<!-- Product card -->
<div class="card" data-variant="success">
    <div data-type="product">
        <img src="product.jpg" alt="Product">
        <div>
            <h3>Product Name</h3>
            <p>Product description goes here.</p>
            <a href="https://example.com/product">View Details</a>
        </div>
    </div>
</div>
```

This example demonstrates how attribute selectors enable a flexible component system with various states, sizes, and variants without complex class hierarchies.

## Performance Considerations

While attribute selectors are powerful, there are some performance considerations to keep in mind:

1. **Specificity** : Attribute selectors have the same specificity as classes. In the specificity hierarchy, they rank as:

* `!important` (avoid when possible)
* Inline styles
* IDs
* Classes, attributes, and pseudo-classes
* Elements and pseudo-elements

1. **Performance Impact** : Modern browsers have optimized attribute selectors significantly, but they can still be slightly slower than class selectors in extremely performance-critical situations. For most websites, this difference is negligible.
2. **Best Practices** :

* For frequently accessed elements or performance-critical animations, consider using class selectors
* For structural or semantic targeting, attribute selectors are excellent
* Avoid extremely complex compound attribute selectors for performance-critical elements
* Combine attribute selectors with class selectors for optimal performance and maintainability

For the vast majority of websites, the convenience and maintainability benefits of attribute selectors far outweigh any potential performance impact.

## Browser Compatibility

Attribute selectors enjoy excellent browser support:

* Basic attribute selectors like `[attr]` and `[attr="value"]` have been supported since Internet Explorer 7
* String matching selectors (`^=`, `$=`, `*=`) have been supported since Internet Explorer 7
* The case-insensitive flag `i` has been supported in all modern browsers since around 2015 (IE 10+)

This broad support makes attribute selectors a safe choice for nearly all production websites, with the possible exception of websites that need to support very old browsers.

## Combining with Modern CSS Features

Attribute selectors become even more powerful when combined with newer CSS features:

```css
/* Combining with CSS Variables */
[data-theme="dark"] {
    --text-color: white;
    --bg-color: #333;
}

[data-theme="light"] {
    --text-color: #333;
    --bg-color: white;
}

body {
    color: var(--text-color);
    background-color: var(--bg-color);
}

/* Combining with Container Queries */
@container (min-width: 400px) {
    [data-layout="compact"] {
        grid-template-columns: repeat(2, 1fr);
    }
}

@container (min-width: 700px) {
    [data-layout="compact"] {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Combining with :has() selector */
form:has(input[required]:invalid) {
    border-left: 4px solid red;
}

.card:has(img[src*="wide"]) {
    grid-column: span 2;
}
```

These combinations allow for extremely powerful, adaptive styling based on attributes, container sizes, and element relationships.

## Conclusion

Attribute selectors represent one of the most powerful yet underutilized features in CSS. From the basic `[attr]` selector to complex string-matching patterns like `[attr^="value"]`, `[attr$="value"]`, and `[attr*="value"]`, they provide precision targeting without requiring additional classes or IDs.

Key advantages of attribute selectors include:

1. **Reduced HTML clutter** : No need to add extra classes for every styling variation
2. **Semantic targeting** : Select elements based on their intrinsic properties and roles
3. **Pattern matching** : Target elements with similar attribute patterns using substring matching
4. **Integration with existing markup** : Style third-party content or CMS-generated HTML without modifying it
5. **Future-proofing** : As new HTML attributes emerge, your selectors will automatically adapt

By mastering attribute selectors and combining them with other CSS features, you can create more maintainable, adaptable, and semantic stylesheets that directly leverage the structure and meaning of your HTML.

Whether you're styling form inputs, categorizing links, working with data attributes, or building complex component systems, attribute selectors provide a powerful tool that bridges the gap between your HTML's semantic structure and your CSS styling needs.
