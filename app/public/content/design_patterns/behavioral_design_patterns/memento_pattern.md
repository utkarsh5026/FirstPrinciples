# The Memento Pattern: Capturing and Restoring State

I'll explain the Memento pattern from first principles, breaking down its purpose, implementation, and applications step by step.

> The Memento pattern is one of the behavioral design patterns that allows you to capture an object's internal state and save it externally without violating encapsulation, so you can restore the object to this state later.

## First Principles: Why We Need State Management

Let's start with the most basic concept: state. In software, an object's state is the data it contains at a specific moment in time. For example, a text editor's state includes the current text, cursor position, and selected text.

Objects change their state as they operate. Sometimes, we need to:

1. Remember a previous state (for "undo" functionality)
2. Save a state (for checkpoints)
3. Restore to a previous state (for rollbacks or recovery)

The challenge is: how do we save an object's state without exposing its internal implementation details?

## The Problem: Encapsulation vs. State Preservation

Consider this simple text editor class:

```java
public class TextEditor {
    private String text = "";
    private int cursorPosition = 0;
  
    public void addText(String newText) {
        text = text.substring(0, cursorPosition) + 
               newText + 
               text.substring(cursorPosition);
        cursorPosition += newText.length();
    }
  
    public void setCursorPosition(int position) {
        this.cursorPosition = position;
    }
  
    public String getText() {
        return text;
    }
}
```

If we want to implement an undo feature, we need to save the editor's state before changes. But how?

### Bad Approach 1: Direct Access

```java
// Problematic code
TextEditor editor = new TextEditor();
String oldText = editor.text; // Error: 'text' is private
int oldCursorPosition = editor.cursorPosition; // Error: 'cursorPosition' is private
```

This breaks encapsulation by accessing private fields.

### Bad Approach 2: Getter/Setter Explosion

```java
// Adding too many getters/setters
public String getText() { return text; }
public void setText(String text) { this.text = text; }
public int getCursorPosition() { return cursorPosition; }
public void setCursorPosition(int position) { this.cursorPosition = position; }
```

This exposes implementation details and creates tight coupling.

## Enter the Memento Pattern

The Memento pattern provides a structured solution by introducing three key components:

1. **Originator** : The object whose state we want to save (e.g., TextEditor)
2. **Memento** : A snapshot of the Originator's state at a point in time
3. **Caretaker** : Manages and stores Mementos without examining their contents

> The beauty of the Memento pattern is that it allows an object to capture its state as a "black box" that only it can understand, preserving encapsulation while enabling state restoration.

## Implementing the Memento Pattern

Let's implement the Memento pattern for our TextEditor:

```java
// 1. The Memento class
public class EditorState {
    private final String text;
    private final int cursorPosition;
  
    // Only the TextEditor can create a Memento
    private EditorState(String text, int cursorPosition) {
        this.text = text;
        this.cursorPosition = cursorPosition;
    }
  
    // These methods are only accessible to the TextEditor
    private String getText() {
        return text;
    }
  
    private int getCursorPosition() {
        return cursorPosition;
    }
  
    // TextEditor needs access to create Mementos
    public static class EditorStateBuilder {
        public static EditorState createState(String text, int cursorPosition) {
            return new EditorState(text, cursorPosition);
        }
    }
}

// 2. The Originator
public class TextEditor {
    private String text = "";
    private int cursorPosition = 0;
  
    public void addText(String newText) {
        text = text.substring(0, cursorPosition) + 
               newText + 
               text.substring(cursorPosition);
        cursorPosition += newText.length();
    }
  
    public void setCursorPosition(int position) {
        this.cursorPosition = position;
    }
  
    // Create a memento with the current state
    public EditorState save() {
        return EditorState.EditorStateBuilder
                .createState(text, cursorPosition);
    }
  
    // Restore from a memento
    public void restore(EditorState state) {
        this.text = state.getText();
        this.cursorPosition = state.getCursorPosition();
    }
  
    public String getText() {
        return text;
    }
}

// 3. The Caretaker
public class History {
    private List<EditorState> states = new ArrayList<>();
  
    public void push(EditorState state) {
        states.add(state);
    }
  
    public EditorState pop() {
        int lastIndex = states.size() - 1;
        if (lastIndex >= 0) {
            EditorState lastState = states.get(lastIndex);
            states.remove(lastIndex);
            return lastState;
        }
        return null;
    }
}
```

Let's break down what's happening:

1. **EditorState (Memento)** captures the editor's state but keeps its data private
2. **TextEditor (Originator)** knows how to create and restore from Mementos
3. **History (Caretaker)** stores the Mementos without examining them

## Using the Memento Pattern: An Example

Now let's see how we'd implement an "undo" feature:

```java
public class TextEditorApp {
    public static void main(String[] args) {
        TextEditor editor = new TextEditor();
        History history = new History();
      
        // Capture initial state
        history.push(editor.save());
      
        // Make changes
        editor.addText("Hello, ");
        // Save state after first change
        history.push(editor.save());
      
        // Make more changes
        editor.addText("world!");
        System.out.println("Current text: " + editor.getText());
        // Output: Current text: Hello, world!
      
        // Undo the last change
        editor.restore(history.pop());
        System.out.println("After undo: " + editor.getText());
        // Output: After undo: Hello, 
      
        // Undo again to empty state
        editor.restore(history.pop());
        System.out.println("After another undo: " + editor.getText());
        // Output: After another undo: 
    }
}
```

This example demonstrates how we:

1. Create a state (Memento) using `editor.save()`
2. Store states in the History (Caretaker)
3. Restore previous states when needed

## Variations and Real-World Examples

### Lightweight Memento

For objects with extensive state, we can implement a "lightweight" memento that only stores the changed state:

```java
public class LightweightEditorState {
    private final Map<String, Object> changedState = new HashMap<>();
  
    public void saveField(String name, Object value) {
        changedState.put(name, value);
    }
  
    public Object getField(String name) {
        return changedState.get(name);
    }
}
```

### Incremental Memento

Instead of storing the entire state, we could store only the operations that changed the state:

```java
public class EditorCommand {
    private final Runnable executeAction;
    private final Runnable undoAction;
  
    public EditorCommand(Runnable executeAction, Runnable undoAction) {
        this.executeAction = executeAction;
        this.undoAction = undoAction;
    }
  
    public void execute() {
        executeAction.run();
    }
  
    public void undo() {
        undoAction.run();
    }
}
```

### Real-World Examples

1. **Text Editors** : Most document editors use Memento for undo/redo.
2. **Game Save States** : Games often save your progress using this pattern.
3. **Database Transactions** : Before committing changes, systems capture the current state.
4. **Version Control Systems** : Git saves snapshots of your codebase.

## Implementing in Different Languages

### Python Implementation

```python
class EditorState:
    def __init__(self, text, cursor_position):
        self._text = text
        self._cursor_position = cursor_position
  
    @property
    def text(self):
        return self._text
  
    @property
    def cursor_position(self):
        return self._cursor_position


class TextEditor:
    def __init__(self):
        self._text = ""
        self._cursor_position = 0
  
    def add_text(self, new_text):
        self._text = (self._text[:self._cursor_position] + 
                     new_text + 
                     self._text[self._cursor_position:])
        self._cursor_position += len(new_text)
  
    def set_cursor_position(self, position):
        self._cursor_position = position
  
    def save(self):
        return EditorState(self._text, self._cursor_position)
  
    def restore(self, state):
        self._text = state.text
        self._cursor_position = state.cursor_position
  
    @property
    def text(self):
        return self._text


class History:
    def __init__(self):
        self._states = []
  
    def push(self, state):
        self._states.append(state)
  
    def pop(self):
        if self._states:
            return self._states.pop()
        return None
```

### JavaScript Implementation

```javascript
class EditorState {
    constructor(text, cursorPosition) {
        this._text = text;
        this._cursorPosition = cursorPosition;
    }
  
    get text() {
        return this._text;
    }
  
    get cursorPosition() {
        return this._cursorPosition;
    }
}

class TextEditor {
    constructor() {
        this._text = "";
        this._cursorPosition = 0;
    }
  
    addText(newText) {
        this._text = this._text.substring(0, this._cursorPosition) + 
                     newText + 
                     this._text.substring(this._cursorPosition);
        this._cursorPosition += newText.length;
    }
  
    setCursorPosition(position) {
        this._cursorPosition = position;
    }
  
    save() {
        return new EditorState(this._text, this._cursorPosition);
    }
  
    restore(state) {
        this._text = state.text;
        this._cursorPosition = state.cursorPosition;
    }
  
    get text() {
        return this._text;
    }
}

class History {
    constructor() {
        this._states = [];
    }
  
    push(state) {
        this._states.push(state);
    }
  
    pop() {
        if (this._states.length > 0) {
            return this._states.pop();
        }
        return null;
    }
}
```

## Practical Benefits of the Memento Pattern

1. **Preserves Encapsulation** : The object's internal state remains private.
2. **Simplifies the Originator** : The Originator doesn't need to track its history.
3. **Provides Clean Recovery Mechanism** : Easily roll back to previous states.
4. **Enables Advanced Features** : Undo/redo, save/load, and transactional behaviors.

## Potential Drawbacks

1. **Memory Usage** : Storing multiple states can consume significant memory, especially for large objects.
2. **Performance Cost** : Creating and restoring from Mementos adds overhead.
3. **Complexity** : Introducing three classes (Originator, Memento, Caretaker) adds complexity.

## When to Use the Memento Pattern

The Memento pattern is ideal when:

> You need to capture and restore an object's state without violating encapsulation, and when a direct interface to obtaining the state would expose implementation details.

Specifically:

1. You need to implement undo/redo functionality
2. You want to create snapshots of an object's state
3. You need to roll back operations after errors
4. You want to implement save/load functionality

## When Not to Use the Memento Pattern

Avoid using the Memento pattern when:

1. Capturing and restoring state isn't necessary
2. The object's state is simple and doesn't change often
3. Memory overhead is a significant concern
4. A simpler approach (like command pattern with undo) will suffice

## The Memento Pattern in the Context of Other Patterns

The Memento pattern often works with:

1. **Command Pattern** : Commands can use Mementos to implement undo
2. **Iterator Pattern** : Iterators can use Mementos to remember their position
3. **State Pattern** : Transition between states can be implemented using Mementos

## Conclusion

The Memento pattern elegantly solves the problem of capturing and restoring an object's state while maintaining encapsulation. It's a powerful tool for implementing undo/redo functionality, creating snapshots, and enabling recovery mechanisms.

By following the principle of keeping the Originator in control of its state through the Memento, we create more maintainable, flexible, and robust software systems that can adapt to changing requirements while preserving clean design.

When implementing complex stateful systems, consider whether the Memento pattern might be the right solution for your state management needs.
