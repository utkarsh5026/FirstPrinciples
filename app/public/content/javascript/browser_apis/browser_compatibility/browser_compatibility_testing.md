I'll explain browser compatibility testing in JavaScript from first principles, with detailed explanations and practical examples. Let me break this down comprehensively.

# Browser Compatibility Testing in JavaScript: A First Principles Approach

## What is Browser Compatibility?

At its most fundamental level, browser compatibility refers to how well a website or web application functions across different web browsers, browser versions, operating systems, and devices. This concept exists because different browsers interpret and execute code differently, despite web standards.

Browser compatibility is rooted in the fact that browsers are complex software applications developed by different organizations (Google for Chrome, Mozilla for Firefox, Apple for Safari, etc.), each with their own rendering engines that interpret HTML, CSS, and JavaScript according to their own implementation of web standards.

## Why Browser Compatibility Testing Matters

Browser compatibility testing is essential because:

1. **User Experience** : Your users access your website from various browsers and devices. If your site doesn't work correctly for a significant portion of your audience, you're essentially excluding them.
2. **Code Reliability** : Code that works in one browser might fail in another due to different JavaScript engines (V8 in Chrome, SpiderMonkey in Firefox, JavaScriptCore in Safari).
3. **Feature Support** : New JavaScript features are implemented at different times by different browsers. Some older browsers might never support certain features.

## The Root Causes of Compatibility Issues

To understand compatibility testing, we must first understand why incompatibilities occur:

1. **Different JavaScript Engines** : Each browser has its own JavaScript engine with unique optimizations and implementations.
2. **Implementation Timing** : Browsers implement new JavaScript features at different times, creating a gap where a feature works in some browsers but not others.
3. **Vendor-Specific Extensions** : Browsers sometimes implement their own non-standard features with vendor prefixes.
4. **Legacy Support** : Some browsers maintain support for deprecated features while others remove them.
5. **Bug Differences** : Each browser has its own unique bugs and quirks.

## Types of Browser Compatibility Issues in JavaScript

Let's explore the common types of compatibility issues:

### 1. Syntax Support

Different browsers support different JavaScript syntax features. For example, older browsers don't support ES6+ features like arrow functions, template literals, or destructuring.

```javascript
// ES6 arrow function - not supported in IE11
const multiply = (a, b) => a * b;

// Traditional function - supported everywhere
function multiplyTraditional(a, b) {
    return a * b;
}
```

In this example, the arrow function syntax won't work in Internet Explorer 11, but the traditional function will work in all browsers.

### 2. API and Method Support

Browsers may support different JavaScript APIs and methods:

```javascript
// Modern browsers support fetch API
if (window.fetch) {
    fetch('/api/data')
        .then(response => response.json())
        .then(data => console.log(data));
} else {
    // Fallback for older browsers that don't support fetch
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/data');
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log(JSON.parse(xhr.responseText));
        }
    };
    xhr.send();
}
```

This code checks if the `fetch` API is available and uses it if possible, falling back to the older XMLHttpRequest when necessary.

### 3. DOM Implementation Differences

The Document Object Model (DOM) can have implementation differences:

```javascript
// Getting computed styles works differently across browsers
const element = document.getElementById('myElement');

// Modern approach
const style = window.getComputedStyle(element);
const marginTop = style.marginTop;

// Some older browsers may require this approach
const oldMarginTop = element.currentStyle ? 
    element.currentStyle.marginTop : 
    window.getComputedStyle(element).marginTop;
```

This example shows how accessing computed styles might require different approaches in different browsers.

## Browser Compatibility Testing Methods

Now let's explore how to actually test for browser compatibility:

### 1. Feature Detection

Feature detection is the most reliable way to handle compatibility. Instead of detecting browser types (which is unreliable), you check if a specific feature is available:

```javascript
// Feature detection for the Geolocation API
if ('geolocation' in navigator) {
    // Geolocation is available
    navigator.geolocation.getCurrentPosition(position => {
        console.log(`Latitude: ${position.coords.latitude}`);
        console.log(`Longitude: ${position.coords.longitude}`);
    });
} else {
    // Geolocation is not available
    console.log('Geolocation is not supported by this browser');
}
```

This code checks if the browser supports geolocation before trying to use it, preventing errors in browsers without support.

### 2. Using Polyfills

Polyfills are pieces of code that provide modern functionality in older browsers:

```javascript
// Polyfill for Array.prototype.includes
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement, fromIndex) {
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }
      
        const o = Object(this);
        const len = o.length >>> 0;
      
        if (len === 0) {
            return false;
        }
      
        const n = fromIndex | 0;
        let k = Math.max(n >= 0 ? n : len + n, 0);
      
        while (k < len) {
            if (o[k] === searchElement) {
                return true;
            }
            k++;
        }
      
        return false;
    };
}

// Now we can use includes() even in browsers that don't natively support it
const array = [1, 2, 3];
console.log(array.includes(2)); // true
```

This polyfill adds the `includes` method to arrays in browsers that don't support it natively.

### 3. Using Transpilers

Transpilers like Babel convert modern JavaScript to code that works in older browsers:

```javascript
// Modern ES6+ code
const add = (a, b) => a + b;
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
const [first, ...rest] = doubled;

// After Babel transpilation, becomes something like:
"use strict";

var add = function add(a, b) {
    return a + b;
};

var numbers = [1, 2, 3];
var doubled = numbers.map(function(n) {
    return n * 2;
});

var first = doubled[0],
    rest = doubled.slice(1);
```

The transpiled code works in older browsers that don't support arrow functions, map, or destructuring.

## Tools for Browser Compatibility Testing

Several tools can help with browser compatibility testing:

### 1. Browser Testing Tools

BrowserStack, LambdaTest, and Sauce Labs let you test your website on real browsers:

```javascript
// Example of how you might use Selenium WebDriver with BrowserStack
const webdriver = require('selenium-webdriver');
const { Builder } = webdriver;

async function runTest() {
    // Configure BrowserStack capabilities
    const capabilities = {
        'browserName': 'Firefox',
        'browser_version': '86.0',
        'os': 'Windows',
        'os_version': '10',
        'browserstack.user': 'your_username',
        'browserstack.key': 'your_access_key'
    };
  
    // Build the driver
    const driver = new Builder()
        .usingServer('https://hub-cloud.browserstack.com/wd/hub')
        .withCapabilities(capabilities)
        .build();
  
    try {
        // Navigate to your website
        await driver.get('https://yourwebsite.com');
      
        // Perform tests
        const title = await driver.getTitle();
        console.log('Page title is: ' + title);
      
        // More test code...
    } finally {
        // Close the browser
        await driver.quit();
    }
}

runTest();
```

This code uses Selenium WebDriver to automate testing on BrowserStack, allowing you to check your website's functionality in Firefox 86 on Windows 10.

### 2. Feature Detection Libraries

Modernizr is a JavaScript library that detects feature support:

```javascript
// Include Modernizr in your project
// Then use it to detect features

// Check if the browser supports CSS Grid
if (Modernizr.cssgrid) {
    // Use CSS Grid for layout
    document.getElementById('container').style.display = 'grid';
} else {
    // Use fallback layout
    document.getElementById('container').style.display = 'flex';
}

// Check if the browser supports localStorage
if (Modernizr.localstorage) {
    // Use localStorage
    localStorage.setItem('key', 'value');
} else {
    // Use a cookie-based fallback
    document.cookie = 'key=value';
}
```

This example shows how Modernizr simplifies feature detection for both JavaScript and CSS features.

### 3. Compatibility Data Sources

"Can I use" provides data on browser support for web features. You can use their data programmatically:

```javascript
// Using the caniuse-api npm package
const caniuse = require('caniuse-api');

// Check which browsers support the fetch API
const supportedBrowsers = caniuse.getSupport('fetch');
console.log('Chrome support: ', supportedBrowsers.chrome);
console.log('Firefox support: ', supportedBrowsers.firefox);
console.log('Safari support: ', supportedBrowsers.safari);

// Check if a feature is supported in a specific browser version
const isSupported = caniuse.isSupported('fetch', 'chrome 40');
console.log('Is fetch supported in Chrome 40? ', isSupported);
```

This code uses the caniuse-api to check browser support for the fetch API.

## Practical Compatibility Testing Workflow

Let's integrate all of these concepts into a practical workflow:

### 1. Define Browser Support Targets

First, decide which browsers and versions you need to support. This depends on your user base:

```javascript
// package.json browserlist configuration
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "not IE 11"
  ]
}
```

This Browserslist configuration targets browsers with more than 1% market share, the last two versions of each major browser, excludes dead browsers, and explicitly excludes IE 11.

### 2. Implement Feature Detection

Use feature detection throughout your code:

```javascript
// Feature detection for IntersectionObserver (lazy loading images)
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('.lazy');
  
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const lazyImage = entry.target;
                lazyImage.src = lazyImage.dataset.src;
                lazyImage.classList.remove('lazy');
                imageObserver.unobserve(lazyImage);
            }
        });
    });
  
    lazyImages.forEach(image => {
        imageObserver.observe(image);
    });
} else {
    // Fallback for browsers without IntersectionObserver
    // Load all images immediately
    document.querySelectorAll('.lazy').forEach(img => {
        img.src = img.dataset.src;
    });
}
```

This code implements lazy loading of images with IntersectionObserver when available, with a fallback for browsers that don't support it.

### 3. Use Build Tools

Set up Babel and other build tools to transpile modern JavaScript:

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: [
          '> 1%',
          'last 2 versions',
          'not dead',
          'not IE 11'
        ]
      },
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ]
};
```

This Babel configuration targets the same browsers as the Browserslist configuration and automatically includes the necessary polyfills based on the JavaScript features you use.

### 4. Implement Automated Testing

Set up automated tests across different browsers:

```javascript
// karma.conf.js example
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'src/**/*.js',
      'test/**/*.spec.js'
    ],
    browsers: ['Chrome', 'Firefox', 'Safari'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    reporters: ['progress'],
    singleRun: true
  });
};
```

This Karma configuration runs your Jasmine tests in Chrome, Firefox, and Safari, ensuring your code works in all three browsers.

### 5. Manual Testing

Supplement automated testing with manual checks:

```javascript
// A simple function to log browser information for manual testing
function logBrowserInfo() {
    console.log('Browser: ' + navigator.userAgent);
    console.log('Viewport Width: ' + window.innerWidth);
    console.log('Viewport Height: ' + window.innerHeight);
    console.log('Device Pixel Ratio: ' + window.devicePixelRatio);
  
    // Log feature support
    console.log('ES6 Support: ' + (typeof Symbol !== 'undefined'));
    console.log('Fetch Support: ' + (typeof fetch !== 'undefined'));
    console.log('IntersectionObserver Support: ' + 
                (typeof IntersectionObserver !== 'undefined'));
}

// Call this function during testing
logBrowserInfo();
```

This function logs useful information for manual testing, helping you understand which features are supported in the current browser.

## Real-World Strategies for Handling Compatibility

Let's explore some strategies for real-world applications:

### 1. Progressive Enhancement

Start with basic functionality that works everywhere, then enhance for modern browsers:

```javascript
// Basic form submission that works everywhere
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };
  
    // Basic AJAX submission using XMLHttpRequest (works everywhere)
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/contact');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            document.getElementById('response').textContent = 'Message sent!';
        } else {
            document.getElementById('response').textContent = 'Error sending message.';
        }
    };
    xhr.send(JSON.stringify(formData));
  
    // Progressive enhancement: Add animation if Web Animations API is supported
    if (document.getElementById('response').animate) {
        document.getElementById('response').animate([
            { opacity: 0 },
            { opacity: 1 }
        ], {
            duration: 500,
            fill: 'forwards'
        });
    } else {
        // Simple fallback for browsers without animation support
        document.getElementById('response').style.opacity = 1;
    }
});
```

This code provides a basic form submission that works in all browsers, with an enhanced animation for browsers that support the Web Animations API.

### 2. Feature Flags

Use feature flags for optional enhancements:

```javascript
// Simple feature flag system
const features = {
    // Feature flags determined by feature detection
    darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme)').media !== 'not all',
    animations: 'animate' in document.documentElement,
    touchEvents: 'ontouchstart' in window,
  
    // Feature flags for advanced features that might cause issues
    experimentalSearch: false,
    betaComments: false
};

// Apply dark mode if supported
if (features.darkMode) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        document.body.classList.add('dark-theme');
    }
}

// Enable touch optimizations if on a touch device
if (features.touchEvents) {
    document.body.classList.add('touch-optimized');
  
    // Larger touch targets
    document.querySelectorAll('.button').forEach(button => {
        button.classList.add('touch-button');
    });
}
```

This code implements feature flags based on browser capabilities and uses them to enable or disable features accordingly.

### 3. Loading Patterns

Optimize performance with different loading patterns for different browsers:

```javascript
// Modern browsers: Use ES modules
if ('noModule' in HTMLScriptElement.prototype) {
    // This browser supports the nomodule attribute, so it supports ES modules
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/js/app.modern.js';
    document.head.appendChild(script);
} else {
    // Legacy browsers: Load transpiled bundle
    const script = document.createElement('script');
    script.src = '/js/app.legacy.js';
    document.head.appendChild(script);
}

// Alternative approach: Use module/nomodule in HTML
// <script type="module" src="/js/app.modern.js"></script>
// <script nomodule src="/js/app.legacy.js"></script>
```

This code dynamically loads different JavaScript bundles based on whether the browser supports ES modules, ensuring optimal performance for modern browsers while maintaining compatibility with older ones.

## Common Pitfalls and How to Avoid Them

Let's look at some common compatibility pitfalls and how to avoid them:

### 1. User Agent Sniffing

Avoid detecting browsers by their user agent strings:

```javascript
// BAD: User agent sniffing is unreliable
function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

// GOOD: Feature detection is more reliable
function supportsWebP() {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
}

// Use the feature detection result
if (supportsWebP()) {
    document.getElementById('hero').src = '/images/hero.webp';
} else {
    document.getElementById('hero').src = '/images/hero.jpg';
}
```

This example shows why feature detection is better than user agent sniffing for determining browser capabilities.

### 2. Inconsistent Event Handling

Different browsers handle events differently:

```javascript
// Handle click events consistently across browsers
function addClickHandler(element, handler) {
    if (element.addEventListener) {
        // Modern browsers
        element.addEventListener('click', handler, false);
    } else if (element.attachEvent) {
        // IE < 9
        element.attachEvent('onclick', function() {
            // Fix 'this' in IE
            return handler.call(element);
        });
    } else {
        // Very old browsers
        element.onclick = handler;
    }
}

// Usage
addClickHandler(document.getElementById('button'), function() {
    console.log('Button clicked!');
});
```

This function provides a consistent way to handle click events across all browsers, including very old ones.

### 3. CSS Renderer Differences

JavaScript often interacts with CSS, which can also have compatibility issues:

```javascript
// Handle CSS compatibility with JavaScript
function applyFlexbox(container) {
    const el = document.createElement('div');
  
    // Check for flexbox support
    if ('flexBasis' in el.style || 
        'webkitFlexBasis' in el.style || 
        'msFlexBasis' in el.style) {
      
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.flexWrap = 'wrap';
      
        // Apply vendor prefixes if needed
        if ('webkitFlexBasis' in el.style) {
            container.style.display = '-webkit-flex';
        } else if ('msFlexBasis' in el.style) {
            container.style.display = '-ms-flexbox';
        }
    } else {
        // Fallback to float-based layout
        Array.from(container.children).forEach(child => {
            child.style.float = 'left';
            child.style.width = '50%';
        });
    }
}

// Usage
applyFlexbox(document.getElementById('container'));
```

This function detects flexbox support and applies the appropriate styles, with fallbacks for browsers without flexbox support.

## Advanced Compatibility Topics

Let's explore some advanced topics in browser compatibility:

### 1. Service Workers and Progressive Web Apps (PWAs)

Service Workers enable offline functionality but aren't supported in all browsers:

```javascript
// Register a service worker with proper feature detection
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
} else {
    // Fallback for browsers without service worker support
    // Implement traditional caching or inform the user
    console.log('Service workers are not supported in this browser.');
  
    // Perhaps load additional resources for offline detection
    window.addEventListener('online', () => {
        document.body.classList.remove('offline');
    });
  
    window.addEventListener('offline', () => {
        document.body.classList.add('offline');
    });
}
```

This code registers a service worker when supported, with a fallback for browsers without service worker support.

### 2. Web Components

Web Components provide reusable custom elements but have varying levels of browser support:

```javascript
// Check for Web Components support
const supportsCustomElements = 'customElements' in window;
const supportsTemplates = 'content' in document.createElement('template');
const supportsShadowDOM = !!HTMLElement.prototype.attachShadow;

// Load polyfills if needed
if (!supportsCustomElements || !supportsTemplates || !supportsShadowDOM) {
    // Load Web Components polyfills
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@webcomponents/webcomponentsjs/webcomponents-bundle.js';
    script.onload = initComponents;
    document.head.appendChild(script);
} else {
    // Browser supports Web Components natively
    initComponents();
}

function initComponents() {
    // Define a custom element
    class HelloWorld extends HTMLElement {
        constructor() {
            super();
          
            // Create a shadow root
            const shadow = this.attachShadow({mode: 'open'});
          
            // Create element
            const wrapper = document.createElement('div');
            wrapper.textContent = 'Hello, World!';
          
            // Add to shadow root
            shadow.appendChild(wrapper);
        }
    }
  
    // Register the custom element
    customElements.define('hello-world', HelloWorld);
}
```

This code checks for Web Components support and loads polyfills if needed before defining and registering a custom element.

### 3. WebAssembly

WebAssembly enables high-performance code but isn't supported in all browsers:

```javascript
// Check for WebAssembly support
if (typeof WebAssembly === 'object' && 
    typeof WebAssembly.instantiate === 'function') {
  
    // WebAssembly is supported
    // Load and run WebAssembly module
    fetch('/wasm/module.wasm')
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.instantiate(bytes))
        .then(results => {
            const instance = results.instance;
          
            // Call exported function
            const result = instance.exports.add(40, 2);
            console.log('WebAssembly result:', result);
        });
} else {
    // WebAssembly is not supported
    // Load JavaScript fallback
    const script = document.createElement('script');
    script.src = '/js/fallback.js';
    document.head.appendChild(script);
  
    // After script loads, call the JavaScript implementation
    script.onload = function() {
        const result = window.addJS(40, 2);
        console.log('JavaScript fallback result:', result);
    };
}
```

This code checks for WebAssembly support and loads a WebAssembly module when supported, with a JavaScript fallback for browsers without WebAssembly support.

## Accessibility and Browser Compatibility

Accessibility and compatibility often overlap:

```javascript
// Make a custom dropdown accessible and cross-browser compatible
function createAccessibleDropdown(selectElement) {
    // Create a wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-dropdown';
    wrapper.setAttribute('tabindex', '0');
  
    // Create the visual dropdown
    const selected = document.createElement('div');
    selected.className = 'selected-option';
    selected.textContent = selectElement.options[selectElement.selectedIndex].text;
  
    // Create the options list
    const optionsList = document.createElement('ul');
    optionsList.className = 'options-list';
    optionsList.setAttribute('role', 'listbox');
    optionsList.style.display = 'none';
  
    // Add each option
    Array.from(selectElement.options).forEach((option, index) => {
        const li = document.createElement('li');
        li.textContent = option.text;
        li.setAttribute('role', 'option');
        li.setAttribute('tabindex', '-1');
        li.dataset.value = option.value;
      
        if (index === selectElement.selectedIndex) {
            li.setAttribute('aria-selected', 'true');
        }
      
        // Handle click with both mouse and keyboard
        li.addEventListener('click', function() {
            updateSelection(this);
        });
      
        optionsList.appendChild(li);
    });
  
    // Add elements to the DOM
    wrapper.appendChild(selected);
    wrapper.appendChild(optionsList);
    selectElement.parentNode.insertBefore(wrapper, selectElement);
    selectElement.style.display = 'none';
  
    // Handle dropdown toggle
    wrapper.addEventListener('click', function() {
        optionsList.style.display = 
            optionsList.style.display === 'none' ? 'block' : 'none';
    });
  
    // Handle keyboard navigation
    wrapper.addEventListener('keydown', function(e) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                optionsList.style.display = 
                    optionsList.style.display === 'none' ? 'block' : 'none';
                break;
            case 'Escape':
                optionsList.style.display = 'none';
                break;
            case 'ArrowDown':
                navigateOptions(1);
                break;
            case 'ArrowUp':
                navigateOptions(-1);
                break;
        }
    });
  
    // Navigate options with keyboard
    function navigateOptions(direction) {
        const options = optionsList.querySelectorAll('li');
        const currentIndex = Array.from(options).findIndex(
            option => option.getAttribute('aria-selected') === 'true'
        );
      
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = options.length - 1;
        if (newIndex >= options.length) newIndex = 0;
      
        updateSelection(options[newIndex]);
    }
  
    // Update selection
    function updateSelection(option) {
        // Update aria-selected
        optionsList.querySelectorAll('li').forEach(opt => {
            opt.setAttribute('aria-selected', 'false');
        });
        option.setAttribute('aria-selected', 'true');
      
        // Update visual selection
        selected.textContent = option.textContent;
      
        // Update actual select element
        selectElement.value = option.dataset.value;
      
        // Trigger change event
        const event = new Event('change');
        selectElement.dispatchEvent(event);
      
        // Hide options list
        optionsList.style.display = 'none';
    }
}

// Usage
document.querySelectorAll('select.enhance').forEach(select => {
    createAccessibleDropdown(select);
});
```

This code creates an accessible custom dropdown that works across browsers, with both mouse and keyboard support.

## Conclusion

Browser compatibility testing in JavaScript is a multifaceted discipline that requires understanding the fundamental differences between browsers, implementing proper feature detection, and using the right tools and techniques to ensure your code works everywhere.

By approaching compatibility from first principles—understanding why browsers differ, how to detect features, and how to provide appropriate fallbacks—you can build robust web applications that work for all users, regardless of their browser choice.

The key takeaways are:

1. Always use feature detection rather than browser detection
2. Provide fallbacks for unsupported features
3. Use transpilers and polyfills to support older browsers
4. Test across multiple browsers, both automatically and manually
5. Follow a progressive enhancement approach whenever possible

By following these principles, you'll create JavaScript applications that provide the best possible experience for all users, regardless of their browser or device.
