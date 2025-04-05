# The Memento Design Pattern in Python

The Memento pattern is a behavioral design pattern that allows you to capture and externalize an object's internal state without violating encapsulation. I'll explain this pattern from first principles, building a thorough understanding through conceptual frameworks and practical Python implementations.

## First Principles: Understanding State and History

At its foundation, the Memento pattern addresses a fundamental need in software: preserving and restoring object states. Think about applications where you need to:

1. Implement undo/redo functionality
2. Create save points or snapshots
3. Track history of changes
4. Roll back to previous states

In each of these cases, we need a way to capture an object's state at specific points in time and later restore that state if needed.

## The Problem the Memento Pattern Solves

Let's first understand the specific problem this pattern addresses:

Imagine you're developing a text editor application. Users expect to be able to undo their changes, which means you need to track the document's state at various points. A naïve approach might be to make all of the document's state variables public, so other objects can save and restore them. However, this would violate encapsulation and make the document class vulnerable to unwanted modifications.

The Memento pattern offers an elegant solution by providing a way to:

1. Capture an object's internal state without exposing its implementation
2. Store this state externally
3. Restore the state when needed
4. Maintain proper encapsulation throughout the process

## Core Components of the Memento Pattern

The Memento pattern consists of three key components:

1. **Originator** : The object whose state we want to save and restore
2. **Memento** : An object that stores a snapshot of the originator's internal state
3. **Caretaker** : Responsible for keeping track of the mementos but never modifies them

Let's understand the responsibilities of each component:

* **Originator** : Creates a memento containing a snapshot of its current internal state and uses mementos to restore its state
* **Memento** : Immutable object that serves as a snapshot of the originator's state
* **Caretaker** : Keeps track of mementos but never examines or modifies their contents

The beauty of this pattern is that the memento's state remains accessible only to the originator that created it, maintaining proper encapsulation.

## A Simple Example: Text Editor

Let's implement a simple text editor with undo functionality using the Memento pattern:

```python
class EditorMemento:
    """
    The Memento class - stores the editor's state
    """
    def __init__(self, content):
        # Make a deep copy to ensure immutability
        self._content = content
  
    def get_content(self):
        return self._content


class Editor:
    """
    The Originator class - creates and restores from Mementos
    """
    def __init__(self):
        self._content = ""
  
    def type(self, words):
        self._content += words
  
    def get_content(self):
        return self._content
  
    def save(self):
        """Create a memento with the current state"""
        return EditorMemento(self._content)
  
    def restore(self, memento):
        """Restore state from a memento"""
        self._content = memento.get_content()


class History:
    """
    The Caretaker class - keeps track of multiple mementos
    """
    def __init__(self):
        self._mementos = []
        self._current_state = -1
  
    def push(self, memento):
        # When a new state is saved after undos, discard all future states
        if self._current_state < len(self._mementos) - 1:
            self._mementos = self._mementos[:self._current_state + 1]
      
        self._mementos.append(memento)
        self._current_state = len(self._mementos) - 1
  
    def undo(self):
        """Return the previous memento"""
        if self._current_state <= 0:
            return None
      
        self._current_state -= 1
        return self._mementos[self._current_state]
  
    def redo(self):
        """Return the next memento"""
        if self._current_state >= len(self._mementos) - 1:
            return None
      
        self._current_state += 1
        return self._mementos[self._current_state]
```

Now, let's see how we can use this implementation:

```python
# Client code
editor = Editor()
history = History()

# Initial save point
history.push(editor.save())

# Edit the text
editor.type("Hello, ")
history.push(editor.save())

editor.type("world!")
history.push(editor.save())

editor.type(" How are you?")
history.push(editor.save())

# Let's see the current content
print(f"Current content: {editor.get_content()}")
# Output: Current content: Hello, world! How are you?

# Undo to get back to "Hello, world!"
previous_state = history.undo()
if previous_state:
    editor.restore(previous_state)

print(f"After undo: {editor.get_content()}")
# Output: After undo: Hello, world!

# Undo again to get back to "Hello, "
previous_state = history.undo()
if previous_state:
    editor.restore(previous_state)

print(f"After another undo: {editor.get_content()}")
# Output: After another undo: Hello, 

# Redo to get back to "Hello, world!"
next_state = history.redo()
if next_state:
    editor.restore(next_state)

print(f"After redo: {editor.get_content()}")
# Output: After redo: Hello, world!

# Make a new change after some undos
editor.type(" Welcome back!")
history.push(editor.save())

print(f"New content: {editor.get_content()}")
# Output: New content: Hello, world! Welcome back!

# Try to redo - should not work as we've created a new branch
next_state = history.redo()
if next_state:
    editor.restore(next_state)
else:
    print("Cannot redo - we're at the most recent change")
# Output: Cannot redo - we're at the most recent change
```

Let's analyze this example:

1. The `Editor` class is our **Originator** that creates and uses mementos.
2. The `EditorMemento` class is our **Memento** that stores the editor's state.
3. The `History` class is our **Caretaker** that keeps track of the mementos.

Notice how the `History` class never directly manipulates the content stored in the mementos. It only stores and provides access to them. This maintains proper encapsulation, as only the `Editor` class knows how to interpret and use the memento's state.

## Deep Dive: Understanding Encapsulation in the Memento Pattern

One of the trickier aspects of implementing the Memento pattern is maintaining proper encapsulation. In our simple example, we exposed a `get_content()` method in the `EditorMemento` class, which might seem to violate encapsulation. Let's explore this further.

In an ideal implementation, the memento's state should only be accessible to the originator that created it. Other objects, including the caretaker, should not be able to access or modify this state.

In languages like C++, this can be achieved using friend classes. In Python, we can simulate this using naming conventions and documentation:

```python
class EditorMemento:
    """
    The Memento class - stores the editor's state
  
    Note: The state should only be accessed by the Editor class.
    """
    def __init__(self, content):
        # Using a leading underscore to indicate this is "private"
        self._content = content
  
    def _get_content(self):
        """
        This method should only be called by the Editor class.
        """
        return self._content
```

While Python doesn't enforce true private methods, this approach communicates the intent that only the `Editor` class should access the memento's state.

## A More Complex Example: Document with Multiple Properties

Let's create a more complex example - a document with multiple properties and a history system that allows undoing and redoing changes:

```python
import copy
import datetime

class DocumentMemento:
    """
    Memento class that stores the document's state
    """
    def __init__(self, title, content, author, created_at):
        self._state = {
            'title': title,
            'content': content,
            'author': author,
            'created_at': created_at
        }
        # Add a timestamp to the memento itself
        self._saved_at = datetime.datetime.now()
  
    def get_state(self):
        """Return the saved state (should only be called by Document)"""
        return self._state
  
    def get_saved_at(self):
        """Return when this memento was created (can be used by Caretaker)"""
        return self._saved_at


class Document:
    """
    Originator class that creates and restores from mementos
    """
    def __init__(self, title="", content="", author=""):
        self._title = title
        self._content = content
        self._author = author
        self._created_at = datetime.datetime.now()
  
    def set_title(self, title):
        self._title = title
  
    def set_content(self, content):
        self._content = content
  
    def set_author(self, author):
        self._author = author
  
    def get_info(self):
        return {
            'title': self._title,
            'content': self._content,
            'author': self._author,
            'created_at': self._created_at
        }
  
    def create_memento(self):
        """Save the current state in a memento"""
        return DocumentMemento(
            self._title,
            self._content,
            self._author,
            self._created_at
        )
  
    def restore_from_memento(self, memento):
        """Restore state from a memento"""
        state = memento.get_state()
        self._title = state['title']
        self._content = state['content']
        self._author = state['author']
        self._created_at = state['created_at']


class DocumentHistory:
    """
    Caretaker class that manages document history
    """
    def __init__(self, document):
        self._document = document
        self._history = []
        self._current_index = -1
      
        # Save initial state
        self.save()
  
    def save(self):
        """Save the current document state"""
        # If we're not at the end of the history, remove everything after current index
        if self._current_index < len(self._history) - 1:
            self._history = self._history[:self._current_index + 1]
      
        # Save the current state
        self._history.append(self._document.create_memento())
        self._current_index = len(self._history) - 1
      
        return self._current_index
  
    def undo(self):
        """Restore the previous state"""
        if self._current_index <= 0:
            return False
      
        self._current_index -= 1
        memento = self._history[self._current_index]
        self._document.restore_from_memento(memento)
        return True
  
    def redo(self):
        """Restore the next state"""
        if self._current_index >= len(self._history) - 1:
            return False
      
        self._current_index += 1
        memento = self._history[self._current_index]
        self._document.restore_from_memento(memento)
        return True
  
    def get_history_info(self):
        """Get information about the available history"""
        return [
            {
                'index': i,
                'timestamp': memento.get_saved_at(),
                'current': i == self._current_index
            }
            for i, memento in enumerate(self._history)
        ]
  
    def restore_to_index(self, index):
        """Restore to a specific index in history"""
        if index < 0 or index >= len(self._history):
            return False
      
        self._current_index = index
        memento = self._history[index]
        self._document.restore_from_memento(memento)
        return True
```

Now, let's use this implementation:

```python
# Create a document
doc = Document("Initial Title", "", "John Doe")

# Create a history manager
history = DocumentHistory(doc)

# Make some changes
doc.set_title("Meeting Notes")
doc.set_content("Discussed project timeline")
history.save()

doc.set_content("Discussed project timeline and budget")
history.save()

doc.set_author("Jane Smith")
history.save()

# Display document info
print("Current document state:")
print(doc.get_info())

# Show history
print("\nHistory:")
for entry in history.get_history_info():
    current_marker = " (current)" if entry['current'] else ""
    print(f"Index {entry['index']}: {entry['timestamp']}{current_marker}")

# Undo twice
print("\nUndo twice:")
history.undo()
history.undo()
print(doc.get_info())

# Redo once
print("\nRedo once:")
history.redo()
print(doc.get_info())

# Make a new change after undoing
doc.set_content("New direction for the project")
history.save()

# Try to redo (should not work)
print("\nTry to redo after new change:")
result = history.redo()
print(f"Redo successful: {result}")

# Restore to a specific point in history
print("\nRestore to index 1:")
history.restore_to_index(1)
print(doc.get_info())
```

This example demonstrates several advanced aspects of the Memento pattern:

1. **Complex state management** : The document has multiple properties that need to be saved and restored.
2. **Timestamp information** : Each memento stores when it was created, which can be useful for the caretaker.
3. **History navigation** : The caretaker allows navigating through the history, including jumping to specific points.
4. **Branch management** : When a new change is made after undoing, the future history is discarded.

## Implementation Variations and Considerations

The Memento pattern can be implemented in different ways depending on your needs. Let's explore some variations and considerations:

### Incremental Mementos

Instead of storing the complete state in each memento, you can store only the changes (deltas) between states. This can be more efficient for memory usage but more complex to implement:

```python
class IncrementalMemento:
    def __init__(self, previous_memento, changes):
        self._previous = previous_memento
        self._changes = changes
  
    def apply_to(self, state):
        """Apply the changes to the given state"""
        if self._previous:
            self._previous.apply_to(state)
      
        # Apply our changes on top
        for key, value in self._changes.items():
            state[key] = value
```

### Serialization for Persistence

In real applications, you might want to persist mementos to disk or a database. This requires serialization:

```python
import pickle

class SerializableMemento:
    def __init__(self, state):
        self._state = state
  
    def get_state(self):
        return self._state
  
    def save_to_file(self, filename):
        with open(filename, 'wb') as f:
            pickle.dump(self._state, f)
  
    @classmethod
    def load_from_file(cls, filename):
        with open(filename, 'rb') as f:
            state = pickle.load(f)
        return cls(state)
```

### Wide vs. Narrow Interface

The Memento pattern often uses what's called a "wide and narrow interface" approach:

* **Wide interface** : Exposes all necessary methods for the originator to access and modify the memento's state
* **Narrow interface** : Exposes limited functionality to the caretaker (usually just storage operations)

In languages with stronger access control than Python, this distinction can be enforced. In Python, we typically rely on conventions:

```python
class Memento:
    """
    Memento with wide and narrow interfaces
    """
    def __init__(self, state):
        self._state = state
  
    # Wide interface - for Originator
    def get_state(self):
        """Full access to state (for Originator only)"""
        return self._state
  
    # Narrow interface - for Caretaker
    def get_metadata(self):
        """Limited information (for Caretaker)"""
        return {
            'timestamp': datetime.datetime.now(),
            'size': len(repr(self._state))
        }
```

## Real-World Example: Drawing Application

Let's create a more practical example - a simple drawing application that lets users create shapes and undo/redo changes:

```python
import copy
import datetime

# Shape classes
class Shape:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.color = color
  
    def move(self, dx, dy):
        self.x += dx
        self.y += dy
  
    def __repr__(self):
        return f"{self.__class__.__name__}(x={self.x}, y={self.y}, color='{self.color}')"

class Circle(Shape):
    def __init__(self, x, y, radius, color):
        super().__init__(x, y, color)
        self.radius = radius
  
    def resize(self, factor):
        self.radius *= factor
  
    def __repr__(self):
        return f"Circle(x={self.x}, y={self.y}, radius={self.radius}, color='{self.color}')"

class Rectangle(Shape):
    def __init__(self, x, y, width, height, color):
        super().__init__(x, y, color)
        self.width = width
        self.height = height
  
    def resize(self, factor):
        self.width *= factor
        self.height *= factor
  
    def __repr__(self):
        return f"Rectangle(x={self.x}, y={self.y}, width={self.width}, height={self.height}, color='{self.color}')"

# Canvas and memento classes
class CanvasMemento:
    def __init__(self, shapes):
        # Deep copy all shapes to preserve their state
        self._shapes = copy.deepcopy(shapes)
        self._timestamp = datetime.datetime.now()
  
    def get_shapes(self):
        """Return the saved shapes (for Canvas only)"""
        return self._shapes
  
    def get_timestamp(self):
        """Return when this memento was created (for anyone)"""
        return self._timestamp

class Canvas:
    def __init__(self):
        self.shapes = []
  
    def add_shape(self, shape):
        self.shapes.append(shape)
  
    def remove_shape(self, index):
        if 0 <= index < len(self.shapes):
            return self.shapes.pop(index)
        return None
  
    def move_shape(self, index, dx, dy):
        if 0 <= index < len(self.shapes):
            self.shapes[index].move(dx, dy)
            return True
        return False
  
    def resize_shape(self, index, factor):
        if 0 <= index < len(self.shapes):
            shape = self.shapes[index]
            # Check if the shape has a resize method
            if hasattr(shape, 'resize') and callable(getattr(shape, 'resize')):
                shape.resize(factor)
                return True
        return False
  
    def create_memento(self):
        """Save the current state"""
        return CanvasMemento(self.shapes)
  
    def restore_from_memento(self, memento):
        """Restore from a memento"""
        self.shapes = copy.deepcopy(memento.get_shapes())
  
    def get_snapshot(self):
        """Return a string representation of the canvas"""
        return "\n".join(str(shape) for shape in self.shapes)

class CanvasHistory:
    def __init__(self, canvas):
        self.canvas = canvas
        self.history = []
        self.current_index = -1
      
        # Save initial state
        self.save()
  
    def save(self):
        """Save the current state"""
        # Remove any future history if we're not at the end
        if self.current_index < len(self.history) - 1:
            self.history = self.history[:self.current_index + 1]
      
        # Save current state
        self.history.append(self.canvas.create_memento())
        self.current_index = len(self.history) - 1
      
        return self.current_index
  
    def undo(self):
        """Restore the previous state"""
        if self.current_index <= 0:
            return False
      
        self.current_index -= 1
        memento = self.history[self.current_index]
        self.canvas.restore_from_memento(memento)
        return True
  
    def redo(self):
        """Restore the next state"""
        if self.current_index >= len(self.history) - 1:
            return False
      
        self.current_index += 1
        memento = self.history[self.current_index]
        self.canvas.restore_from_memento(memento)
        return True
  
    def get_history_info(self):
        return [
            {
                'index': i,
                'timestamp': memento.get_timestamp(),
                'current': i == self.current_index
            }
            for i, memento in enumerate(self.history)
        ]
```

Now, let's use this drawing application:

```python
# Create a canvas
canvas = Canvas()
history = CanvasHistory(canvas)

# Add some shapes
canvas.add_shape(Circle(100, 100, 50, "red"))
history.save()

canvas.add_shape(Rectangle(200, 200, 80, 40, "blue"))
history.save()

# Move a shape
canvas.move_shape(0, 25, 25)  # Move the circle
history.save()

# Resize a shape
canvas.resize_shape(1, 1.5)  # Resize the rectangle
history.save()

# Print the canvas state
print("Current canvas state:")
print(canvas.get_snapshot())

# Undo twice
print("\nUndo twice:")
history.undo()
history.undo()
print(canvas.get_snapshot())

# Redo once
print("\nRedo once:")
history.redo()
print(canvas.get_snapshot())

# Add a new shape after undoing
canvas.add_shape(Circle(300, 300, 30, "green"))
history.save()

# Show the history
print("\nHistory:")
for entry in history.get_history_info():
    current_marker = " (current)" if entry['current'] else ""
    print(f"Index {entry['index']}: {entry['timestamp']}{current_marker}")
```

This example demonstrates how the Memento pattern can be used in a graphical application to implement undo/redo functionality. Each action (adding, moving, or resizing shapes) creates a new memento, and the history manager allows navigating through these states.

## Performance Considerations

When implementing the Memento pattern, be mindful of performance implications:

### Memory Usage

Each memento stores a snapshot of the object's state, which can consume significant memory if:

* The object's state is large
* You store many mementos
* You create mementos frequently

Strategies to mitigate memory issues:

1. **Limit history size** : Keep only a fixed number of recent mementos
2. **Incremental mementos** : Store only the changes between states
3. **Selective state saving** : Only save parts of the state that actually change
4. **Compression** : Compress memento data for long-term storage

```python
class LimitedHistory:
    def __init__(self, max_size=20):
        self._mementos = []
        self._current_index = -1
        self._max_size = max_size
  
    def push(self, memento):
        # Discard future states if needed
        if self._current_index < len(self._mementos) - 1:
            self._mementos = self._mementos[:self._current_index + 1]
      
        # Add new memento
        self._mementos.append(memento)
        self._current_index = len(self._mementos) - 1
      
        # Limit size if needed
        if len(self._mementos) > self._max_size:
            # Remove oldest memento
            self._mementos.pop(0)
            self._current_index -= 1
```

### Performance Optimization: Lazy Copy

Instead of immediately creating deep copies, you can use lazy copying or copy-on-write strategies:

```python
class LazyMemento:
    def __init__(self, state_reference):
        self._state_ref = state_reference
        self._copied_state = None
  
    def get_state(self):
        # Create a copy only when the state is actually accessed
        if self._copied_state is None:
            self._copied_state = copy.deepcopy(self._state_ref)
        return self._copied_state
```

## Combining with Other Patterns

The Memento pattern often works well with other design patterns:

### Command Pattern

The Command pattern is frequently used alongside Memento for implementing undo/redo functionality:

```python
class Command(ABC):
    @abstractmethod
    def execute(self):
        pass
  
    @abstractmethod
    def undo(self):
        pass

class MoveShapeCommand(Command):
    def __init__(self, canvas, shape_index, dx, dy):
        self.canvas = canvas
        self.shape_index = shape_index
        self.dx = dx
        self.dy = dy
        self.memento = None
  
    def execute(self):
        # Save state before modification
        self.memento = self.canvas.create_memento()
        # Perform the move
        return self.canvas.move_shape(self.shape_index, self.dx, self.dy)
  
    def undo(self):
        if self.memento:
            self.canvas.restore_from_memento(self.memento)
            return True
        return False
```

### Iterator Pattern

The Iterator pattern can be useful for traversing through mementos:

```python
class HistoryIterator:
    def __init__(self, history):
        self.history = history
        self.index = 0
  
    def __iter__(self):
        return self
  
    def __next__(self):
        if self.index >= len(self.history._mementos):
            raise StopIteration
      
        memento = self.history._mementos[self.index]
        self.index += 1
        return memento
```

## Advanced Implementation: Snapshot Points

In some applications, you might want to create designated "snapshot points" rather than saving every change:

```python
class SnapshotManager:
    def __init__(self, originator):
        self.originator = originator
        self.snapshots = {}
  
    def create_snapshot(self, name):
        """Create a named snapshot"""
        self.snapshots[name] = self.originator.create_memento()
        return name
  
    def restore_snapshot(self, name):
        """Restore a named snapshot"""
        if name in self.snapshots:
            self.originator.restore_from_memento(self.snapshots[name])
            return True
        return False
  
    def delete_snapshot(self, name):
        """Delete a named snapshot"""
        if name in self.snapshots:
            del self.snapshots[name]
            return True
        return False
  
    def list_snapshots(self):
        """List all available snapshots"""
        return list(self.snapshots.keys())
```

This approach is useful for applications like games (save points) or document editing (named versions).

## When to Use the Memento Pattern

The Memento pattern is most beneficial when:

1. You need to capture and restore an object's state without violating encapsulation
2. A direct interface to obtaining the state would expose implementation details and break encapsulation
3. You need to implement undo mechanisms, rollbacks, or history functionality
4. You want to create snapshots of an object's state that can be restored later

Common applications include:

* Text editors and word processors (undo/redo)
* Graphics applications (history of edits)
* Game development (save points)
* Transaction management (rollbacks)
* Software modeling tools (state versioning)

## Alternative Approaches

For simpler cases or when the drawbacks of the Memento pattern are significant, consider these alternatives:

1. **Serialization** : For very simple objects, serializing the entire object might be sufficient
2. **Command Pattern with reverse operations** : Instead of storing states, store commands that can be undone
3. **Event Sourcing** : Record all events/changes and replay them to reconstruct state (good for distributed systems)
4. **Prototype Pattern** : Clone objects at specific points to create snapshots

## Conclusion

The Memento pattern provides an elegant solution for capturing and restoring object states while maintaining proper encapsulation. By separating the responsibilities into Originator, Memento, and Caretaker components, the pattern enables clean implementations of undo/redo functionality, history tracking, and state snapshots.

We've explored this pattern from first principles, examining its key components, implementation variations, and practical Python examples. From simple text editors to complex drawing applications, the Memento pattern offers a structured approach to managing object state over time.

The pattern does come with trade-offs, particularly regarding memory usage and performance, but these can be mitigated with careful design choices like limiting history size or using incremental state storage.

Understanding the Memento pattern adds a valuable tool to your design pattern arsenal, particularly for applications that require history tracking, undo functionality, or any form of state management over time.
