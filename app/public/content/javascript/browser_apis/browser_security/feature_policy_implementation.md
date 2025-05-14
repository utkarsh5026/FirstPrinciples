# Understanding Feature Policy Implementation in Browser JavaScript

I'll explain Feature Policy (now evolved into Permissions Policy) from first principles, breaking down what it is, why it exists, and how to implement it in browser JavaScript. I'll use practical examples and ensure each concept builds on the previous one.

## First Principles: Web Security and Permissions

At its most fundamental level, web security is about controlling what code can do in a browser environment. Browsers are powerful platforms that can access sensitive hardware and data, so they need robust security mechanisms.

### The Origin Model

Web security starts with the  **same-origin policy** , which separates websites by origin (protocol + domain + port):

```javascript
// Example origins:
const origin1 = 'https://example.com'; // https protocol, example.com domain
const origin2 = 'https://example.com:8080'; // Different port = different origin
const origin3 = 'http://example.com'; // Different protocol = different origin
```

While same-origin policy provides isolation, it's not granular enough for modern web applications, especially when dealing with embedded content like iframes.

## What is Feature Policy?

Feature Policy (now called Permissions Policy) is a mechanism that gives website owners fine-grained control over which browser features can be used by a page and its embedded content.

### Core Problem It Solves

Consider this scenario: You embed a third-party widget on your site, but you don't want it to access the user's camera. Without Feature Policy, this would be difficult to control.

```javascript
// Without Feature Policy, any embedded content could potentially:
const video = document.createElement('video');
navigator.mediaDevices.getUserMedia({ video: true }) // Access camera
  .then(stream => video.srcObject = stream);
```

## Implementing Feature Policy

### Method 1: HTTP Headers

The most common way to implement Feature Policy is through HTTP headers set by the server:

```javascript
// This is not JavaScript you write, but a header your server sends:
// Feature-Policy: camera 'none'; microphone 'self'
```

Let's break this down:

* `camera 'none'`: No document (not even your own) can use the camera
* `microphone 'self'`: Only your own origin can use the microphone

### Method 2: Using the `allow` Attribute on iframes

You can also set policies directly on iframes:

```javascript
// Creating an iframe with restricted permissions
const iframe = document.createElement('iframe');
iframe.src = 'https://third-party-widget.com';
iframe.allow = 'camera none; microphone none; geolocation self';
document.body.appendChild(iframe);
```

In this example:

* We're creating an iframe element to embed third-party content
* We're explicitly denying camera and microphone access
* We're only allowing geolocation if the iframe is from the same origin as the parent page

### Real-world Example: Creating a Secure Video Conference Frame

Let's imagine you're building a secure application that includes a video conferencing feature from a third-party provider:

```javascript
function createSecureConferenceFrame(roomId) {
  // Create the iframe
  const conferenceFrame = document.createElement('iframe');
  
  // Set the source to the video conferencing service
  conferenceFrame.src = `https://video-conf-service.com/room/${roomId}`;
  
  // Configure feature policies
  conferenceFrame.allow = 'camera; microphone; fullscreen; display-capture none';
  
  // Add additional security attributes
  conferenceFrame.sandbox = 'allow-scripts allow-same-origin allow-forms';
  
  // Apply some styling
  conferenceFrame.style.width = '100%';
  conferenceFrame.style.height = '500px';
  conferenceFrame.style.border = '1px solid #ccc';
  
  // Add to page
  document.getElementById('conference-container').appendChild(conferenceFrame);
  
  return conferenceFrame;
}

// Usage
const frameElement = createSecureConferenceFrame('meeting-123');
```

In this example, we're:

1. Creating an iframe that loads our third-party video conferencing service
2. Allowing camera and microphone access (necessary for video conferencing)
3. Allowing fullscreen capability for better user experience
4. Explicitly disallowing display-capture to prevent screen recording
5. Using iframe sandbox attribute for additional security

## Checking Feature Policy Status

You can detect whether a feature is allowed using the `FeaturePolicy` interface:

```javascript
// Check if a specific feature is allowed
function isFeatureAllowed(featureName) {
  // Check if the Feature Policy API is available
  if (document.featurePolicy) {
    // Returns true if the feature is allowed
    return document.featurePolicy.allowsFeature(featureName);
  }
  
  // Fallback if Feature Policy API isn't available
  console.warn('Feature Policy API not supported in this browser');
  return null;
}

// Usage examples
console.log('Camera allowed:', isFeatureAllowed('camera'));
console.log('Microphone allowed:', isFeatureAllowed('microphone'));
console.log('Geolocation allowed:', isFeatureAllowed('geolocation'));
```

This function checks whether a specific feature is allowed according to the current Feature Policy. It's useful for conditionally enabling UI elements based on available features.

## Feature Policy in Modern Frameworks

When working with modern frameworks like React, you might implement Feature Policy like this:

```javascript
// React component example
import React, { useEffect, useState } from 'react';

function SecureVideoPlayer({ videoSrc }) {
  const [cameraAllowed, setCameraAllowed] = useState(false);
  
  useEffect(() => {
    // Check if camera is allowed when component mounts
    if (document.featurePolicy && 
        document.featurePolicy.allowsFeature('camera')) {
      setCameraAllowed(true);
    } else {
      console.warn('Camera access is not allowed by Feature Policy');
    }
  }, []);
  
  return (
    <div className="video-container">
      {cameraAllowed ? (
        <video src={videoSrc} controls />
      ) : (
        <div className="error-message">
          Camera access is required but not available due to Feature Policy restrictions.
        </div>
      )}
    </div>
  );
}

export default SecureVideoPlayer;
```

This React component:

1. Checks if the camera feature is allowed when the component mounts
2. Conditionally renders either a video player or an error message based on the result
3. Provides feedback to the user about why a feature might not be working

## Monitoring Feature Policy Violations

For debugging and security monitoring, you can listen for policy violations:

```javascript
// Set up a listener for Feature Policy violations
document.addEventListener('featurepolicyviolation', (event) => {
  console.error('Feature Policy Violation:', {
    feature: event.featureId,
    source: event.sourceFile,
    lineNumber: event.lineNumber,
    columnNumber: event.columnNumber,
    disposition: event.disposition
  });
  
  // You might want to log this to your analytics or monitoring system
  sendViolationToAnalytics(event);
});

// Simple example of sending to analytics
function sendViolationToAnalytics(violationEvent) {
  // In a real implementation, this would send data to your analytics service
  const violationData = {
    feature: violationEvent.featureId,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    // Add other relevant information
  };
  
  console.log('Sending violation to analytics:', violationData);
  // fetch('https://your-analytics-endpoint.com/violations', {
  //   method: 'POST',
  //   body: JSON.stringify(violationData)
  // });
}
```

This code sets up an event listener for Feature Policy violations, logs them to the console, and could send them to an analytics service for monitoring.

## Feature Policy vs. Content Security Policy

It's important to understand that Feature Policy complements Content Security Policy (CSP):

```javascript
// This would typically be set in HTTP headers, not JavaScript:
// Content-Security-Policy: script-src 'self'
// Feature-Policy: camera 'none'; microphone 'self'

// CSP controls what resources can be loaded
// Feature Policy controls what browser features can be used
```

CSP focuses on controlling what resources can be loaded, while Feature Policy controls what browser APIs can be used.

## Evolution to Permissions Policy

Feature Policy has evolved into Permissions Policy. The implementation is similar, but the header name has changed:

```javascript
// Old Feature Policy header:
// Feature-Policy: camera 'none'; microphone 'self'

// New Permissions Policy header:
// Permissions-Policy: camera=(), microphone=(self)
```

The syntax has changed from space-separated tokens to a more structured format using parentheses.

## A Complete Example: Secure Media Capture Application

Let's put it all together with a more comprehensive example of a media capture application that uses Feature/Permissions Policy:

```javascript
class SecureMediaCapture {
  constructor(containerElement) {
    this.containerElement = containerElement;
    this.videoElement = null;
    this.stream = null;
    this.supportedFeatures = this.checkSupportedFeatures();
  
    // Set up UI based on available features
    this.initializeUI();
  }
  
  // Check which media features are allowed by policy
  checkSupportedFeatures() {
    const features = {
      camera: false,
      microphone: false,
      displayCapture: false
    };
  
    if (document.featurePolicy) {
      features.camera = document.featurePolicy.allowsFeature('camera');
      features.microphone = document.featurePolicy.allowsFeature('microphone');
      features.displayCapture = document.featurePolicy.allowsFeature('display-capture');
    }
  
    return features;
  }
  
  // Create UI elements based on available features
  initializeUI() {
    // Clear container
    this.containerElement.innerHTML = '';
  
    // Create video element
    this.videoElement = document.createElement('video');
    this.videoElement.autoplay = true;
    this.videoElement.muted = true;
    this.videoElement.style.width = '100%';
    this.videoElement.style.maxHeight = '300px';
    this.containerElement.appendChild(this.videoElement);
  
    // Create control buttons
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'media-controls';
  
    // Only show camera button if allowed
    if (this.supportedFeatures.camera) {
      const cameraButton = document.createElement('button');
      cameraButton.textContent = 'Start Camera';
      cameraButton.onclick = () => this.toggleCamera();
      controlsDiv.appendChild(cameraButton);
    } else {
      const warning = document.createElement('p');
      warning.textContent = 'Camera access is restricted by Feature Policy';
      warning.style.color = 'red';
      controlsDiv.appendChild(warning);
    }
  
    // Only show screen share button if allowed
    if (this.supportedFeatures.displayCapture) {
      const screenButton = document.createElement('button');
      screenButton.textContent = 'Share Screen';
      screenButton.onclick = () => this.shareScreen();
      controlsDiv.appendChild(screenButton);
    }
  
    this.containerElement.appendChild(controlsDiv);
  }
  
  // Toggle camera on/off
  async toggleCamera() {
    try {
      if (this.stream) {
        // Turn off camera
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
        this.videoElement.srcObject = null;
        return;
      }
    
      // Start camera
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: this.supportedFeatures.microphone
      });
      this.videoElement.srcObject = this.stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera: ' + error.message);
    }
  }
  
  // Start screen sharing
  async shareScreen() {
    try {
      // Stop any existing stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
    
      // Start screen sharing
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: this.supportedFeatures.microphone
      });
      this.videoElement.srcObject = this.stream;
    
      // Handle when user stops sharing
      this.stream.getVideoTracks()[0].onended = () => {
        this.videoElement.srcObject = null;
        this.stream = null;
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
      alert('Could not share screen: ' + error.message);
    }
  }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('media-container');
  const mediaCapture = new SecureMediaCapture(container);
});
```

This example:

1. Creates a class to handle media capture
2. Checks for feature availability based on Feature Policy
3. Dynamically builds a UI showing only allowed features
4. Provides methods to toggle camera and screen sharing
5. Handles errors gracefully

## Browser Compatibility and Feature Detection

Feature Policy is not supported in all browsers, so proper feature detection is crucial:

```javascript
function checkFeaturePolicySupport() {
  // Check for basic Feature Policy support
  const hasFeaturePolicy = typeof document.featurePolicy !== 'undefined';
  
  // Check for Permissions Policy (the newer version)
  const hasPermissionsPolicy = typeof document.permissionsPolicy !== 'undefined';
  
  // Result object with detailed info
  const result = {
    supported: hasFeaturePolicy || hasPermissionsPolicy,
    type: hasPermissionsPolicy ? 'Permissions Policy' : 
          (hasFeaturePolicy ? 'Feature Policy' : 'Not Supported'),
    apiAvailable: hasFeaturePolicy || hasPermissionsPolicy
  };
  
  // If supported, test a specific feature
  if (result.supported) {
    try {
      // Try to query a common feature
      const method = hasPermissionsPolicy ? 
        'allowedFeatures' : 'allowsFeature';
    
      if (hasPermissionsPolicy) {
        result.exampleFeatures = Array.from(document.permissionsPolicy[method]());
      } else if (hasFeaturePolicy) {
        result.cameraAllowed = document.featurePolicy.allowsFeature('camera');
      }
    } catch (e) {
      result.error = e.message;
    }
  }
  
  return result;
}

// Usage
const policySupport = checkFeaturePolicySupport();
console.log('Feature/Permissions Policy Support:', policySupport);
```

This function:

1. Checks for both Feature Policy and Permissions Policy support
2. Provides information about which version is supported
3. Tests functionality by checking a specific feature
4. Returns a detailed object with support information

## Conclusion

Feature Policy (now Permissions Policy) provides a powerful way to control what browser features can be used by your pages and embedded content. By implementing it properly, you can:

1. Increase security by limiting what embedded content can do
2. Improve privacy by controlling access to sensitive APIs
3. Enhance performance by preventing unnecessary feature usage
4. Create more predictable applications by explicitly defining requirements

The implementation involves:

* Setting HTTP headers on your server
* Using the `allow` attribute on iframes
* Checking for feature availability in your JavaScript code
* Adapting your UI and functionality based on available features
* Handling violations for monitoring and debugging

By understanding Feature Policy from first principles, you can create more secure and privacy-respecting web applications that explicitly declare their intentions regarding browser feature usage.
