# Subresource Integrity (SRI) Checking in Browser JavaScript

Subresource Integrity (SRI) is a security feature that enables browsers to verify that resources they fetch (like JavaScript or CSS files) are delivered without unexpected manipulation. I'll explain this concept from first principles, with examples and detailed explanations.

## Understanding the Problem Space

To understand why SRI exists, let's first consider how web resources are typically loaded:

When a browser renders a webpage, it often needs to fetch additional resources like scripts, stylesheets, images, etc. Traditionally, these resources are specified with simple URL references:

```html
<script src="https://cdn.example.com/library.js"></script>
```

The fundamental issue here is  **trust** . When your browser downloads this script, how can it be sure that what it received is exactly what the website developer intended? Several threats exist:

1. **CDN compromise** - The content delivery network could be hacked
2. **Man-in-the-middle attacks** - Someone could intercept and modify the script during transit
3. **DNS hijacking** - The domain could be redirected to a malicious server

Any of these scenarios could result in malicious code being executed in your users' browsers under your site's domain and privileges.

## The Core Concept: Cryptographic Hashing

At the heart of SRI is a fundamental cryptographic concept:  **hashing** .

A hash function takes arbitrary input data and produces a fixed-size string (the hash value) that uniquely represents that data. The key properties of cryptographic hash functions are:

1. **Deterministic** - The same input always produces the same output
2. **Fast computation** - It's quick to calculate the hash of any input
3. **Preimage resistance** - It's practically impossible to derive the original input from just the hash
4. **Small changes cause large differences** - Even a tiny change to the input produces a completely different hash
5. **Collision resistance** - It's extremely difficult to find two different inputs that produce the same hash

For example, using SHA-384 (a common hash algorithm):

* The hash of "Hello World" is: `99514329186b2f6ae4a1329e7ee6c610a729636335174ac6b740f9028396fcc803d0e93863a7c3d90f86beee782f4f3f`
* The hash of "Hello World." (note the added period) is completely different: `1980140ab68fe011b6b8a8a9bf547c3dcb19374846606a7bbdb48ce5b207f575f97afccc877bd0e35883f2c0c9ebc4c4`

This property makes hashing perfect for verifying file integrity.

## How SRI Works: Step by Step

Here's how SRI functions from a technical perspective:

1. **Resource preparation** : The developer computes a cryptographic hash of the resource (JavaScript file, CSS file, etc.) in its final form.
2. **HTML markup modification** : The developer includes this hash in the HTML that references the resource using the `integrity` attribute.
3. **Browser download** : When the browser encounters this element, it downloads the resource as usual.
4. **Verification** : The browser computes the hash of the downloaded resource using the specified algorithm.
5. **Comparison** : The browser compares the computed hash with the expected hash specified in the `integrity` attribute.
6. **Action** : If the hashes match, the resource is used. If they don't match, the resource is rejected, and the browser refuses to execute it.

## SRI Implementation Example

Here's a basic example of how to implement SRI in HTML:

```html
<script 
  src="https://cdn.example.com/library.js" 
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC" 
  crossorigin="anonymous">
</script>
```

Let's break down each attribute:

* `src`: The URL of the JavaScript file to load
* `integrity`: The expected hash of the file, prefixed with the hash algorithm
* `crossorigin`: Required for SRI checks on files from different domains

The `integrity` value has two parts:

1. The hash algorithm used (sha384 in this case)
2. The Base64-encoded hash value

## Generating SRI Hashes

To implement SRI, you need to generate the appropriate hash. Here's a simple Node.js example that calculates an SRI hash:

```javascript
const crypto = require('crypto');
const fs = require('fs');

// Read the file
const fileBuffer = fs.readFileSync('library.js');

// Create hash
const hash = crypto.createHash('sha384')
  .update(fileBuffer)
  .digest('base64');

console.log(`sha384-${hash}`);
// Output: sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC
```

This code:

1. Reads the file contents into memory
2. Creates a SHA-384 hash instance
3. Updates it with the file contents
4. Generates the digest in Base64 format
5. Prefixes it with the algorithm name

You could also use online tools or browser-based utilities to generate these hashes.

## Browser Processing of SRI

When a browser encounters an SRI-enabled resource tag, it follows this workflow:

1. Parse the `integrity` attribute to determine the expected hash algorithm and value
2. Download the resource as usual
3. Calculate the hash of the received content using the specified algorithm
4. Compare this calculated hash with the expected hash
5. If they match exactly, process the resource normally
6. If they don't match, refuse to execute the resource and trigger a console error

Here's what happens behind the scenes in pseudocode:

```javascript
// Browser internal processing (conceptual)
function loadResourceWithSRI(url, expectedAlgorithm, expectedHash) {
  const resource = download(url);
  const actualHash = calculateHash(resource, expectedAlgorithm);
  
  if (actualHash === expectedHash) {
    executeResource(resource);
  } else {
    console.error("SRI validation failed");
    // Resource is blocked from executing
  }
}
```

## Supported Resource Types

While our examples focus on JavaScript, SRI supports several resource types:

```html
<!-- JavaScript with SRI -->
<script src="..." integrity="..." crossorigin="..."></script>

<!-- CSS with SRI -->
<link rel="stylesheet" href="..." integrity="..." crossorigin="...">

<!-- Can also be used with preload -->
<link rel="preload" href="..." as="script" integrity="..." crossorigin="...">
```

Each follows the same pattern, allowing verification of the integrity of different resource types.

## Practical Example: Using SRI with a Common Library

Let's walk through a real-world example using a popular library like jQuery:

```html
<script 
  src="https://code.jquery.com/jquery-3.6.0.min.js" 
  integrity="sha384-vtXRMe3mGCbOeY7l30aIg8H9p3GdeSe4IFlP6G8JMa7o7lXvnz3GFKzPxzJdPfGK" 
  crossorigin="anonymous">
</script>
```

In this example:

1. We're loading jQuery from its official CDN
2. We're specifying the expected SHA-384 hash
3. We're indicating that CORS should be used

If the jQuery file is tampered with anywhere between the CDN and the user's browser, the hash will not match, and the browser will refuse to execute it.

## Error Handling and Fallbacks

What happens when an SRI check fails? The browser simply doesn't execute the resource, which could break your website. To handle this, you can implement fallbacks:

```html
<!-- Primary script with SRI -->
<script 
  src="https://cdn.example.com/library.js" 
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC" 
  crossorigin="anonymous"
  onerror="handleSRIError()">
</script>

<script>
  function handleSRIError() {
    // Load a backup version or show an error message
    const fallbackScript = document.createElement('script');
    fallbackScript.src = "https://backup-cdn.example.com/library.js";
    document.head.appendChild(fallbackScript);
  
    console.warn("Primary resource failed SRI check, using fallback");
  }
</script>
```

This script:

1. Attempts to load the primary resource with SRI
2. If that fails (either network failure or SRI check failure), the `onerror` handler is called
3. The handler loads a fallback version from a different source

## SRI and Content Security Policy (CSP)

SRI works well with Content Security Policy, another security feature. You can require SRI for certain types of resources:

```
Content-Security-Policy: require-sri-for script style;
```

This HTTP header tells the browser to reject any script or style resources that don't have integrity attributes, providing an additional layer of security.

## Multiple Hash Support

You can specify multiple hash algorithms for better compatibility:

```html
<script 
  src="https://example.com/library.js" 
  integrity="sha256-AbCdEf123... sha384-GhIjKl456..." 
  crossorigin="anonymous">
</script>
```

The browser will verify using any of the provided hashes. If any one matches, the resource passes the check.

## Common Challenges with SRI

1. **Dynamic content** : If your resources change frequently, you need to update the hash values each time.
2. **Cache busting** : When using techniques like appending query parameters for cache busting, the resource URL changes but its content remains the same:

```html
<!-- This works fine with SRI -->
<script 
  src="https://example.com/library.js?v=123" 
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC" 
  crossorigin="anonymous">
</script>
```

The query parameter doesn't affect the file content, so the hash remains valid.

3. **Error diagnosis** : When SRI fails, it's not always obvious why. Browser developer tools will show a console error like:

```
Failed to find a valid digest in the 'integrity' attribute for resource 'https://example.com/library.js'.
```

## SRI in Development Workflows

Integrating SRI into your development workflow typically involves:

1. **Build process** : Calculate resource hashes during your build process
2. **Template insertion** : Insert those hashes into your HTML templates
3. **Testing** : Verify that SRI checks pass in your test environment

Here's a simplified webpack configuration example:

```javascript
// webpack.config.js
const SriPlugin = require('webpack-subresource-integrity');

module.exports = {
  output: {
    crossOriginLoading: 'anonymous', // Enable CORS for SRI
  },
  plugins: [
    new SriPlugin({
      hashFuncNames: ['sha384'], // Hash algorithms to use
      enabled: process.env.NODE_ENV === 'production', // Only in production
    }),
  ],
};
```

This plugin:

1. Calculates SRI hashes for bundled resources
2. Inserts the appropriate integrity attributes in your HTML

## The Evolution of SRI

SRI was introduced to address growing concerns about supply chain attacks, particularly as more websites began to rely on third-party CDNs and libraries.

Before SRI, websites had to choose between:

1. **Performance** - Using fast global CDNs but accepting security risks
2. **Security** - Hosting everything themselves but losing CDN benefits

SRI enables the best of both worlds: the performance of CDNs with the security of self-hosting.

## Limitations of SRI

While powerful, SRI has limitations:

1. **Initial HTML** : SRI can't protect the initial HTML document itself
2. **Dynamic resources** : Resources that change frequently require hash updates
3. **Runtime modifications** : SRI only verifies the initial resource load, not runtime behaviors
4. **Browser support** : Older browsers don't support SRI (though support is now widespread)

## Browser Compatibility

SRI is supported in all modern browsers:

* Chrome 45+
* Firefox 43+
* Safari 11.1+
* Edge 17+

For older browsers, SRI gracefully degrades—they simply ignore the integrity attribute and load resources as they normally would.

## Conclusion

Subresource Integrity is a powerful security feature that helps protect websites from compromised CDNs and man-in-the-middle attacks. By verifying that resources match their expected cryptographic hashes, browsers can ensure that only legitimate code runs on your website.

SRI represents a shift in web security thinking—from trusting the source to verifying the content—embracing the security principle of "trust, but verify."

By implementing SRI, especially for third-party resources, you add an important layer of defense to your web application's security posture with minimal performance impact.
