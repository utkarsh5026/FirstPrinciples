# Event Object Properties and Methods: From First Principles

Let's explore the Event object in JavaScript from fundamental principles, building our understanding step by step.

## What is an Event?

At its most basic level, an event is a signal that something has happened. In the context of web programming, events are how the browser communicates that something interesting has occurred that you might want to respond to. These "interesting occurrences" could be:

* A user clicking a button
* A webpage finishing loading
* A form being submitted
* A key being pressed on the keyboard
* The mouse moving over an element

Let's use a real-world analogy to understand this better: imagine you're in a room with a doorbell. When someone presses the doorbell (the event), you hear a sound (the signal) and then decide to respond by opening the door (the event handler).

## The Event Object Fundamentals

When an event occurs in JavaScript, the browser automatically creates an Event object. This object contains information about the event that just happened.

Think of the Event object as a detailed report about the event. If someone rings your doorbell, the Event object would be like a report containing details such as:

* Who rang the bell
* At what time they rang it
* How hard they pressed it
* How many times they pressed it

Let's look at a simple example:

```javascript
// This creates a button element
const button = document.createElement("button");
button.textContent = "Click me";
document.body.appendChild(button);

// When the button is clicked, the event object is automatically passed to our handler
button.addEventListener("click", function(event) {
  // 'event' is the Event object
  console.log("An event occurred:", event);
  console.log("Event type:", event.type);
  console.log("Target element:", event.target);
});
```

In this example, when you click the button, the browser creates a click event object and passes it to our function. We named this parameter `event` (though you could name it anything), and it contains all the information about what just happened.

## Common Event Object Properties

Let's explore the core properties that nearly all event objects have:

### 1. `event.type`

This property tells you what kind of event occurred. Was it a click? A keypress? A form submission?

```javascript
document.body.addEventListener("click", function(event) {
  console.log(event.type); // Outputs: "click"
});

document.body.addEventListener("mouseover", function(event) {
  console.log(event.type); // Outputs: "mouseover"
});
```

### 2. `event.target`

This property refers to the element on which the event originally occurred. It answers the question: "What element was interacted with?"

```javascript
// Let's create a button with some text inside
const button = document.createElement("button");
const buttonText = document.createElement("span");
buttonText.textContent = "Click me";
button.appendChild(buttonText);
document.body.appendChild(button);

button.addEventListener("click", function(event) {
  // If you click on the button itself
  console.log(event.target); // References the button element
  
  // If you click specifically on the text inside the button
  // event.target might be the span element!
  if (event.target === buttonText) {
    console.log("You clicked on the text inside the button");
  }
});
```

This example demonstrates an important point: `event.target` is precisely the element that was clicked, which might be a child of the element where you attached the event listener.

### 3. `event.currentTarget`

While `event.target` points to the element where the event occurred, `event.currentTarget` always refers to the element to which the event handler is attached.

```javascript
const parentDiv = document.createElement("div");
parentDiv.style.padding = "20px";
parentDiv.style.backgroundColor = "lightblue";

const childButton = document.createElement("button");
childButton.textContent = "Click me";
parentDiv.appendChild(childButton);
document.body.appendChild(parentDiv);

parentDiv.addEventListener("click", function(event) {
  console.log("Target (what was clicked):", event.target);
  console.log("Current Target (where listener is attached):", event.currentTarget);
  
  // If you click the button:
  // Target would be the button element
  // Current Target would be the div element
});
```

### 4. `event.timeStamp`

This property tells you when the event occurred, measured as milliseconds since the document was loaded.

```javascript
document.addEventListener("DOMContentLoaded", function(event) {
  console.log("Page loaded at timestamp:", event.timeStamp); // Might show something like 45.32
  
  document.body.addEventListener("click", function(event) {
    console.log("Click occurred at timestamp:", event.timeStamp); // Shows when the click happened
    console.log("Time since page load:", event.timeStamp - document.timeline.currentTime);
  });
});
```

### 5. `event.bubbles` and `event.cancelable`

These boolean properties tell you about the event's behavior:

* `bubbles`: Does this event bubble up through the DOM?
* `cancelable`: Can this event's default action be prevented?

```javascript
const link = document.createElement("a");
link.href = "https://example.com";
link.textContent = "Example Link";
document.body.appendChild(link);

link.addEventListener("click", function(event) {
  console.log("Does this event bubble?", event.bubbles); // true for click
  console.log("Can we prevent default?", event.cancelable); // true for click
  
  // Since this event is cancelable, we can prevent the default action (navigating to the URL)
  event.preventDefault();
});
```

## Event Methods

Now let's look at the methods that allow us to control the event flow:

### 1. `event.preventDefault()`

This method stops the browser from performing the default action associated with the event. For example:

* Preventing a form submission from refreshing the page
* Preventing a link from navigating to a new URL
* Preventing a checkbox from being checked/unchecked

```javascript
// Create a form with an input field and submit button
const form = document.createElement("form");
const input = document.createElement("input");
input.type = "text";
input.placeholder = "Enter some text";
const submit = document.createElement("button");
submit.type = "submit";
submit.textContent = "Submit";
form.appendChild(input);
form.appendChild(submit);
document.body.appendChild(form);

form.addEventListener("submit", function(event) {
  // This prevents the form from actually submitting and refreshing the page
  event.preventDefault();
  
  // Now we can handle the submission our own way
  console.log("Form data:", input.value);
  
  // We could send this data via AJAX instead of a traditional form submission
});
```

### 2. `event.stopPropagation()`

This method stops the event from bubbling up to parent elements. To understand this, we need to know about event bubbling:

When an event happens on an element, it first runs the handlers on that element, then on its parent, then on other ancestors. This is called "bubbling up."

```javascript
// Create nested elements
const outer = document.createElement("div");
outer.style.padding = "25px";
outer.style.backgroundColor = "lightblue";

const middle = document.createElement("div");
middle.style.padding = "25px";
middle.style.backgroundColor = "lightgreen";

const inner = document.createElement("button");
inner.textContent = "Click me";

middle.appendChild(inner);
outer.appendChild(middle);
document.body.appendChild(outer);

// Add event listeners to all elements
inner.addEventListener("click", function(event) {
  console.log("Inner button clicked");
  // Uncommenting the next line would prevent the event from reaching the middle and outer handlers
  // event.stopPropagation();
});

middle.addEventListener("click", function() {
  console.log("Middle div clicked");
});

outer.addEventListener("click", function() {
  console.log("Outer div clicked");
});
```

If you click the button, you'll see three messages in the console because the event bubbles up. If you uncomment the `stopPropagation()` line, you'll only see "Inner button clicked".

### 3. `event.stopImmediatePropagation()`

This method is like `stopPropagation()` but even stronger. It not only prevents the event from bubbling to parent elements but also stops any other handlers on the same element from running.

```javascript
const button = document.createElement("button");
button.textContent = "Click me";
document.body.appendChild(button);

// First handler
button.addEventListener("click", function(event) {
  console.log("First handler");
  event.stopImmediatePropagation();
});

// Second handler - won't run if stopImmediatePropagation is called in the first handler
button.addEventListener("click", function() {
  console.log("Second handler");
});
```

In this example, clicking the button will only log "First handler" because `stopImmediatePropagation()` prevents the second handler from running.

## Specific Event Types and Their Properties

The basic Event object is extended by more specialized event objects for different types of events. Let's explore some common ones:

### 1. Mouse Events

Mouse events (like click, mouseover, mouseout) have properties related to mouse position and state:

```javascript
document.body.addEventListener("click", function(event) {
  // Coordinates relative to the viewport
  console.log("Viewport X, Y:", event.clientX, event.clientY);
  
  // Coordinates relative to the document
  console.log("Document X, Y:", event.pageX, event.pageY);
  
  // Which mouse button was pressed (0: left, 1: middle, 2: right)
  console.log("Mouse button:", event.button);
  
  // Was Shift/Ctrl/Alt held during the click?
  console.log("Modifier keys:", 
    event.shiftKey, event.ctrlKey, event.altKey, event.metaKey);
});
```

### 2. Keyboard Events

Keyboard events (keydown, keyup, keypress) contain information about which keys were pressed:

```javascript
document.addEventListener("keydown", function(event) {
  // The key that was pressed (e.g., "a", "Enter", "ArrowUp")
  console.log("Key pressed:", event.key);
  
  // Numeric code for the key (less reliable, consider using .key instead)
  console.log("Key code:", event.keyCode);
  
  // Modifier keys held down
  if (event.ctrlKey && event.key === "s") {
    console.log("Ctrl+S was pressed");
    event.preventDefault(); // Prevent the browser's save dialog
  }
});
```

### 3. Form Events

Form events have properties related to forms and their inputs:

```javascript
const form = document.createElement("form");
const input = document.createElement("input");
input.type = "text";
form.appendChild(input);
document.body.appendChild(form);

// Input event fires whenever the value changes
input.addEventListener("input", function(event) {
  console.log("New value:", event.target.value);
});

// Change event fires when the value is committed (e.g., by pressing Enter)
input.addEventListener("change", function(event) {
  console.log("Committed value:", event.target.value);
});

// Submit event fires when the form is submitted
form.addEventListener("submit", function(event) {
  event.preventDefault();
  console.log("Form submitted with value:", input.value);
});
```

## Event Delegation: A Powerful Pattern

Event delegation is a technique that uses event bubbling to handle events for multiple elements with a single event listener. This is especially useful when you have many similar elements or when elements are dynamically added and removed.

```javascript
// Create a list
const list = document.createElement("ul");

// Add some items
for (let i = 1; i <= 5; i++) {
  const item = document.createElement("li");
  item.textContent = `Item ${i}`;
  item.dataset.id = i; // Store some data on the element
  list.appendChild(item);
}

document.body.appendChild(list);

// Instead of adding an event listener to each item,
// we add one listener to the parent list
list.addEventListener("click", function(event) {
  // Check if the clicked element is an li
  if (event.target.tagName === "LI") {
    console.log("Clicked on item with ID:", event.target.dataset.id);
  
    // We can even add new items dynamically, and they'll still work
    if (event.target.dataset.id === "5") {
      const newItem = document.createElement("li");
      newItem.textContent = "New Item";
      newItem.dataset.id = "new";
      list.appendChild(newItem);
    }
  }
});
```

This approach is much more efficient than adding separate event listeners to each list item, especially when there are many items or when items are added/removed dynamically.

## Creating Custom Events

You're not limited to the built-in events. You can create your own custom events:

```javascript
// Create a button
const button = document.createElement("button");
button.textContent = "Trigger Custom Event";
document.body.appendChild(button);

// Create an element that will listen for our custom event
const listener = document.createElement("div");
listener.textContent = "I'm listening for the custom event";
document.body.appendChild(listener);

// Add an event listener for our custom event
listener.addEventListener("superClick", function(event) {
  console.log("Custom event received!");
  console.log("Custom data:", event.detail.message);
  this.textContent = "Event received: " + event.detail.message;
});

// When the button is clicked, dispatch our custom event
button.addEventListener("click", function() {
  // Create a custom event with some data
  const customEvent = new CustomEvent("superClick", {
    bubbles: true,
    cancelable: true,
    detail: { message: "Hello from custom event!" }
  });
  
  // Dispatch the event
  listener.dispatchEvent(customEvent);
});
```

In this example, we created a custom "superClick" event with custom data in the `detail` property.

## Managing Memory with Event Removal

When elements are removed from the DOM, their event listeners can cause memory leaks if not properly cleaned up. The `removeEventListener` method lets us remove event handlers when they're no longer needed:

```javascript
const button = document.createElement("button");
button.textContent = "Click me once";
document.body.appendChild(button);

// Define the handler function separately so we can reference it later
function oneTimeHandler(event) {
  console.log("Button was clicked!");
  button.textContent = "Already clicked";
  
  // Remove the event listener after it's been used once
  button.removeEventListener("click", oneTimeHandler);
}

// Add the event listener
button.addEventListener("click", oneTimeHandler);
```

This ensures that the handler function will only run once, even if the user clicks multiple times.

## Understanding Event Flow: Capturing and Bubbling

The DOM events actually flow in two phases:

1. **Capturing phase** : From the window down to the target element
2. **Bubbling phase** : From the target back up to the window

By default, event handlers are executed during the bubbling phase, but you can set them to run during the capturing phase instead:

```javascript
// Create nested elements
const outer = document.createElement("div");
outer.style.padding = "25px";
outer.style.backgroundColor = "lightblue";

const middle = document.createElement("div");
middle.style.padding = "25px";
middle.style.backgroundColor = "lightgreen";

const inner = document.createElement("button");
inner.textContent = "Click me";

middle.appendChild(inner);
outer.appendChild(middle);
document.body.appendChild(outer);

// The third parameter (true) enables capturing phase
outer.addEventListener("click", function() {
  console.log("Outer - Capturing phase");
}, true);

middle.addEventListener("click", function() {
  console.log("Middle - Capturing phase");
}, true);

inner.addEventListener("click", function() {
  console.log("Inner - Capturing phase");
}, true);

// These run during bubbling phase (the default)
outer.addEventListener("click", function() {
  console.log("Outer - Bubbling phase");
});

middle.addEventListener("click", function() {
  console.log("Middle - Bubbling phase");
});

inner.addEventListener("click", function() {
  console.log("Inner - Bubbling phase");
});
```

If you click the inner button, the events will fire in this order:

1. Outer - Capturing phase
2. Middle - Capturing phase
3. Inner - Capturing phase
4. Inner - Bubbling phase
5. Middle - Bubbling phase
6. Outer - Bubbling phase

This gives you fine-grained control over when your event handlers execute.

## Practical Example: A Simple To-Do List

Let's put all these concepts together in a practical example:

```javascript
// Create our container
const todoApp = document.createElement("div");
todoApp.className = "todo-app";

// Create the input form
const form = document.createElement("form");
const input = document.createElement("input");
input.type = "text";
input.placeholder = "Add a new task";
const addButton = document.createElement("button");
addButton.type = "submit";
addButton.textContent = "Add";
form.appendChild(input);
form.appendChild(addButton);

// Create the task list
const taskList = document.createElement("ul");
taskList.className = "task-list";

// Add everything to the container
todoApp.appendChild(form);
todoApp.appendChild(taskList);

// Add the container to the document
document.body.appendChild(todoApp);

// Handle form submissions
form.addEventListener("submit", function(event) {
  // Prevent the page from refreshing
  event.preventDefault();
  
  // Get the input value
  const taskText = input.value.trim();
  
  // Don't add empty tasks
  if (taskText === "") return;
  
  // Create a new task item
  const taskItem = document.createElement("li");
  
  // Create the task text
  const taskTextSpan = document.createElement("span");
  taskTextSpan.textContent = taskText;
  taskItem.appendChild(taskTextSpan);
  
  // Create a delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-btn";
  taskItem.appendChild(deleteButton);
  
  // Add the task to the list
  taskList.appendChild(taskItem);
  
  // Clear the input
  input.value = "";
  
  // Focus back on the input
  input.focus();
  
  // Create and dispatch a custom event
  const newTaskEvent = new CustomEvent("taskAdded", {
    bubbles: true,
    detail: { text: taskText }
  });
  taskItem.dispatchEvent(newTaskEvent);
});

// Use event delegation for the task list
taskList.addEventListener("click", function(event) {
  // Check if a delete button was clicked
  if (event.target.className === "delete-btn") {
    // Get the parent li element
    const taskItem = event.target.parentElement;
  
    // Create a custom event before removing
    const taskRemovedEvent = new CustomEvent("taskRemoved", {
      bubbles: true,
      detail: { text: taskItem.querySelector("span").textContent }
    });
  
    // Dispatch the event
    taskItem.dispatchEvent(taskRemovedEvent);
  
    // Remove the task
    taskList.removeChild(taskItem);
  }
  
  // Check if the task text was clicked
  if (event.target.tagName === "SPAN") {
    // Toggle a "completed" class
    event.target.classList.toggle("completed");
  
    // Create and dispatch a custom event
    const taskToggledEvent = new CustomEvent("taskToggled", {
      bubbles: true,
      detail: { 
        text: event.target.textContent,
        completed: event.target.classList.contains("completed")
      }
    });
    event.target.dispatchEvent(taskToggledEvent);
  }
});

// Listen for our custom events at the app level
todoApp.addEventListener("taskAdded", function(event) {
  console.log("Task added:", event.detail.text);
});

todoApp.addEventListener("taskRemoved", function(event) {
  console.log("Task removed:", event.detail.text);
});

todoApp.addEventListener("taskToggled", function(event) {
  console.log(
    "Task", 
    event.detail.text, 
    "marked as", 
    event.detail.completed ? "completed" : "not completed"
  );
});
```

In this example, we've used:

* Event prevention (`preventDefault`)
* Event delegation for the task list
* Custom events for various actions
* Event properties to get information about what was clicked
* DOM manipulation in response to events

## Summary of Event Object Properties and Methods

Let's recap the key properties and methods we've explored:

### Core Properties

* `event.type`: The type of event (e.g., "click", "submit")
* `event.target`: The element that triggered the event
* `event.currentTarget`: The element that the event handler is attached to
* `event.timeStamp`: When the event occurred
* `event.bubbles`: Whether the event bubbles up
* `event.cancelable`: Whether the default action can be prevented

### Mouse Event Properties

* `event.clientX/Y`: Coordinates relative to the viewport
* `event.pageX/Y`: Coordinates relative to the document
* `event.button`: Which mouse button was pressed
* `event.shiftKey`, `event.ctrlKey`, `event.altKey`: Modifier key states

### Keyboard Event Properties

* `event.key`: The key that was pressed
* `event.keyCode`: The key's numeric code (deprecated)
* `event.shiftKey`, `event.ctrlKey`, etc.: Modifier key states

### Methods

* `event.preventDefault()`: Prevents the default action
* `event.stopPropagation()`: Stops event bubbling
* `event.stopImmediatePropagation()`: Stops event bubbling and other handlers
* `element.addEventListener()`: Adds an event listener
* `element.removeEventListener()`: Removes an event listener
* `element.dispatchEvent()`: Triggers an event programmatically

By understanding these fundamental principles of events in JavaScript, you can create interactive, responsive web applications that efficiently respond to user actions. The event-driven approach is at the heart of modern web development, allowing you to build applications that feel dynamic and alive.
