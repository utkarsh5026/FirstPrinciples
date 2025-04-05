# Design Patterns in Python: A First Principles Guide

Design patterns represent proven solutions to common programming problems. They provide a shared vocabulary for developers and help create more maintainable and flexible code. Let's explore these patterns from first principles, with concrete Python examples and detailed explanations of when to use each one.

## What Are Design Patterns?

At their core, design patterns are reusable solutions to common problems that arise during software design. They're not finished code that you can simply copy and paste, but rather templates that guide you toward an effective solution.

Design patterns typically fall into three categories:

1. **Creational Patterns**: Handle object creation mechanisms
2. **Structural Patterns**: Deal with object composition and relationships
3. **Behavioral Patterns**: Focus on communication between objects

Let's explore each pattern in detail, with practical Python implementations.

## Creational Patterns

### Singleton Pattern

**First Principles**: The Singleton pattern ensures a class has only one instance and provides a global point of access to it. This is useful when exactly one object is needed to coordinate actions across the system.

In Python, we have several approaches to implement singletons:

#### Example 1: Using a Module

```python
# singleton.py
_instance = None

def get_instance():
    global _instance
    if _instance is None:
        _instance = {}  # Could be any object
    return _instance
```

In this example, Python's module system naturally enforces the singleton behavior. When you import this module in different parts of your code, you'll always get the same instance.

#### Example 2: Using a Class with `__new__`

```python
class Singleton:
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self, value=None):
        # This will be called every time, even if the instance already exists
        # So we need to be careful about re-initialization
        if not hasattr(self, 'value'):
            self.value = value

# Testing the singleton
s1 = Singleton("first")
s2 = Singleton("second")
print(s1 is s2)  # True
print(s1.value)  # "first" (not "second")
```

In this implementation, we override the `__new__` method, which is responsible for creating new instances. We check if an instance already exists and return it if it does, otherwise we create a new one.

**When to use**:
- Database connections
- Configuration managers
- Logging classes
- Thread pools

**Considerations**: 
- Singletons can make code harder to test
- They introduce global state, which can lead to unexpected behavior
- In Python, module-level variables often provide the same benefits without the drawbacks

### Factory Method Pattern

**First Principles**: The Factory Method pattern defines an interface for creating objects but lets subclasses decide which classes to instantiate. It promotes loose coupling by separating the creation logic from the client code.

#### Example: Document Creator

```python
from abc import ABC, abstractmethod

# Abstract Product
class Document(ABC):
    @abstractmethod
    def create(self):
        pass

# Concrete Products
class PDFDocument(Document):
    def create(self):
        return "Creating PDF document"

class WordDocument(Document):
    def create(self):
        return "Creating Word document"

# Creator (Factory)
class DocumentCreator:
    def create_document(self, doc_type):
        if doc_type == "pdf":
            return PDFDocument()
        elif doc_type == "word":
            return WordDocument()
        else:
            raise ValueError(f"Unknown document type: {doc_type}")

# Client code
creator = DocumentCreator()
pdf = creator.create_document("pdf")
print(pdf.create())  # "Creating PDF document"
```

In this example:
1. We define an abstract `Document` class that serves as our product interface
2. We create concrete implementations (`PDFDocument` and `WordDocument`)
3. The `DocumentCreator` factory decides which implementation to instantiate based on the input

**When to use**:
- When you don't know which concrete classes you'll need at compile time
- When you want to provide users with a way to extend your system's components
- When you want to reuse existing objects instead of creating new ones

**Considerations**:
- Python's dynamic nature and first-class functions make factories simpler than in strongly typed languages
- Often, a simple function can replace a complex factory class hierarchy

### Builder Pattern

**First Principles**: The Builder pattern separates the construction of a complex object from its representation. It allows the same construction process to create different representations.

#### Example: HTML Document Builder

```python
class HTMLBuilder:
    def __init__(self):
        self.root = None
        self.head = None
        self.body = None
    
    def add_root(self):
        self.root = "<html>"
        return self
    
    def add_head(self, title):
        self.head = f"<head><title>{title}</title></head>"
        return self
    
    def add_body(self, content):
        self.body = f"<body>{content}</body>"
        return self
    
    def build(self):
        if not self.root:
            raise ValueError("Root element missing")
        
        result = f"{self.root}\n"
        if self.head:
            result += f"  {self.head}\n"
        if self.body:
            result += f"  {self.body}\n"
        result += "</html>"
        return result

# Client code
builder = HTMLBuilder()
html = builder.add_root().add_head("My Page").add_body("<h1>Hello World</h1>").build()
print(html)
# <html>
#   <head><title>My Page</title></head>
#   <body><h1>Hello World</h1></body>
# </html>
```

In this example:
1. The `HTMLBuilder` class gradually builds different parts of an HTML document
2. Each method returns `self`, allowing for method chaining
3. The `build()` method assembles the final document

**When to use**:
- When an object has many optional components or configurations
- When construction logic is complex
- When you want to create different representations of an object

**Considerations**:
- Python's named parameters and default values can sometimes replace the need for builders
- For very complex objects, builders provide better readability than constructors with many parameters

### Prototype Pattern

**First Principles**: The Prototype pattern creates new objects by copying existing ones, allowing you to produce new instances without coupling to their specific classes.

#### Example: Shape Cloning

```python
import copy

class Prototype:
    def clone(self):
        return copy.deepcopy(self)

class Circle(Prototype):
    def __init__(self, radius, position):
        self.radius = radius
        self.position = position  # A list [x, y]
    
    def __str__(self):
        return f"Circle(radius={self.radius}, position={self.position})"

# Client code
original = Circle(5, [10, 10])
clone = original.clone()

# Modify the clone
clone.radius = 10
clone.position[0] = 20

print(original)  # Circle(radius=5, position=[10, 10])
print(clone)     # Circle(radius=10, position=[20, 10])
```

In this example:
1. We define a `Prototype` class with a `clone()` method using Python's `copy.deepcopy()`
2. The `Circle` class inherits this behavior
3. We create a new circle by cloning an existing one, then modify it

**When to use**:
- When creating a new object is more expensive than copying an existing one
- When your code shouldn't depend on the concrete classes of objects you need to create
- When you need to keep the number of classes in your system minimal

**Considerations**:
- Python's `copy` module makes implementation straightforward
- Deep copying can be expensive for complex object graphs
- You need to handle any resources that can't be simply copied (like open file handles)

### Abstract Factory Pattern

**First Principles**: The Abstract Factory pattern provides an interface for creating families of related or dependent objects without specifying their concrete classes.

#### Example: UI Component Factory

```python
from abc import ABC, abstractmethod

# Abstract Products
class Button(ABC):
    @abstractmethod
    def paint(self):
        pass

class Checkbox(ABC):
    @abstractmethod
    def paint(self):
        pass

# Concrete Products for Windows
class WindowsButton(Button):
    def paint(self):
        return "Rendering a Windows-style button"

class WindowsCheckbox(Checkbox):
    def paint(self):
        return "Rendering a Windows-style checkbox"

# Concrete Products for macOS
class MacOSButton(Button):
    def paint(self):
        return "Rendering a macOS-style button"

class MacOSCheckbox(Checkbox):
    def paint(self):
        return "Rendering a macOS-style checkbox"

# Abstract Factory
class GUIFactory(ABC):
    @abstractmethod
    def create_button(self):
        pass
    
    @abstractmethod
    def create_checkbox(self):
        pass

# Concrete Factories
class WindowsFactory(GUIFactory):
    def create_button(self):
        return WindowsButton()
    
    def create_checkbox(self):
        return WindowsCheckbox()

class MacOSFactory(GUIFactory):
    def create_button(self):
        return MacOSButton()
    
    def create_checkbox(self):
        return MacOSCheckbox()

# Client code
def create_ui(factory):
    button = factory.create_button()
    checkbox = factory.create_checkbox()
    return button.paint(), checkbox.paint()

# Let's try with different factories
windows_factory = WindowsFactory()
windows_results = create_ui(windows_factory)
print(windows_results)  # ('Rendering a Windows-style button', 'Rendering a Windows-style checkbox')

macos_factory = MacOSFactory()
macos_results = create_ui(macos_factory)
print(macos_results)  # ('Rendering a macOS-style button', 'Rendering a macOS-style checkbox')
```

In this example:
1. We define abstract product interfaces (`Button`, `Checkbox`)
2. We implement concrete products for different platforms (Windows, macOS)
3. We create an abstract factory interface (`GUIFactory`)
4. We implement concrete factories (`WindowsFactory`, `MacOSFactory`)
5. Client code uses the factory to create related objects without knowing their concrete classes

**When to use**:
- When your code needs to work with various families of related products
- When you want to provide a library of products without exposing implementation details
- When you want to ensure that the products you're using are compatible with each other

**Considerations**:
- More complex than Factory Method but provides more flexibility
- Can become very complex if many different product types need to be created
- Python's duck typing can sometimes eliminate the need for formal interfaces

## Structural Patterns

### Adapter Pattern

**First Principles**: The Adapter pattern converts the interface of a class into another interface clients expect. It allows classes to work together that couldn't otherwise because of incompatible interfaces.

#### Example: Payment Gateway Adapter

```python
# Existing class with incompatible interface
class OldPaymentSystem:
    def legacy_payment(self, amount, currency):
        return f"Processing ${amount} {currency} payment via legacy system"

# Target interface
class PaymentProcessor:
    def process_payment(self, amount):
        pass

# Adapter
class PaymentSystemAdapter(PaymentProcessor):
    def __init__(self, old_system):
        self.old_system = old_system
    
    def process_payment(self, amount):
        # Adapt the call to the legacy system
        return self.old_system.legacy_payment(amount, "USD")

# Client code
def client_code(payment_processor, amount):
    return payment_processor.process_payment(amount)

# Using the adapter
legacy_system = OldPaymentSystem()
adapter = PaymentSystemAdapter(legacy_system)
result = client_code(adapter, 100)
print(result)  # "Processing $100 USD payment via legacy system"
```

In this example:
1. We have an existing `OldPaymentSystem` with an incompatible interface
2. We define a target interface `PaymentProcessor` that our client expects
3. The `PaymentSystemAdapter` makes the old system work with the new interface
4. Client code can now use the old system through the adapter

**When to use**:
- When you need to use an existing class with an incompatible interface
- When you want to reuse existing subclasses that lack certain functionality
- When you need to make classes with incompatible interfaces work together

**Considerations**:
- In Python, duck typing and the `__getattr__` method can sometimes eliminate the need for formal adapters
- Adapters can add complexity, so consider if redesigning the original class is feasible

### Decorator Pattern

**First Principles**: The Decorator pattern attaches additional responsibilities to an object dynamically. It provides a flexible alternative to subclassing for extending functionality.

#### Example 1: Function Decorators

```python
# A simple function decorator
def log_execution(func):
    def wrapper(*args, **kwargs):
        print(f"Executing {func.__name__} with args: {args}, kwargs: {kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned: {result}")
        return result
    return wrapper

# Usage with decorator syntax
@log_execution
def add(a, b):
    return a + b

# Test the decorator
result = add(3, 5)  # Logs execution details and returns 8
```

This example demonstrates Python's built-in decorator syntax. The `@log_execution` decorator wraps the `add` function, adding logging functionality without modifying the original function.

#### Example 2: Object Decorators

```python
from abc import ABC, abstractmethod

# Component interface
class TextComponent(ABC):
    @abstractmethod
    def render(self):
        pass

# Concrete component
class PlainText(TextComponent):
    def __init__(self, text):
        self.text = text
    
    def render(self):
        return self.text

# Base decorator
class TextDecorator(TextComponent):
    def __init__(self, component):
        self.component = component
    
    def render(self):
        return self.component.render()

# Concrete decorators
class BoldDecorator(TextDecorator):
    def render(self):
        return f"<b>{self.component.render()}</b>"

class ItalicDecorator(TextDecorator):
    def render(self):
        return f"<i>{self.component.render()}</i>"

# Client code
text = PlainText("Hello, World!")
bold_text = BoldDecorator(text)
italic_bold_text = ItalicDecorator(bold_text)

print(text.render())            # "Hello, World!"
print(bold_text.render())       # "<b>Hello, World!</b>"
print(italic_bold_text.render()) # "<i><b>Hello, World!</b></i>"
```

In this example:
1. We define a component interface (`TextComponent`)
2. We create a concrete component (`PlainText`)
3. We create a base decorator class (`TextDecorator`) that conforms to the same interface
4. We implement concrete decorators (`BoldDecorator`, `ItalicDecorator`) that add functionality
5. We can stack decorators to combine functionality

**When to use**:
- When you need to add responsibilities to objects dynamically without affecting other objects
- When extension by subclassing is impractical or impossible
- When you want to add features to individual objects without affecting the class hierarchy

**Considerations**:
- Python's built-in decorator syntax simplifies function decoration
- Object decorators can be more complex but provide great flexibility
- Decorators can result in many small objects that can be hard to debug

### Proxy Pattern

**First Principles**: The Proxy pattern provides a surrogate or placeholder for another object to control access to it. It can manage expensive operations, control access rights, or add behavior before or after accessing the real object.

#### Example: Image Loading Proxy

```python
from abc import ABC, abstractmethod
import time

# Subject interface
class Image(ABC):
    @abstractmethod
    def display(self):
        pass

# Real subject
class RealImage(Image):
    def __init__(self, filename):
        self.filename = filename
        self._load_from_disk()
    
    def _load_from_disk(self):
        print(f"Loading image {self.filename} from disk...")
        # Simulate loading delay
        time.sleep(1)
    
    def display(self):
        return f"Displaying image {self.filename}"

# Proxy
class ImageProxy(Image):
    def __init__(self, filename):
        self.filename = filename
        self.real_image = None
    
    def display(self):
        # Load the image only when display is called
        if self.real_image is None:
            self.real_image = RealImage(self.filename)
        return self.real_image.display()

# Client code
def client_code(image):
    # Client doesn't know if it's working with the
    # real image or a proxy
    return image.display()

# Using a proxy
proxy = ImageProxy("sample.jpg")
print("Image created, but not loaded yet")
# When we call display, the image is loaded
print(client_code(proxy))
```

In this example:
1. We define a common `Image` interface
2. `RealImage` is the actual object that loads an image from disk (a potentially expensive operation)
3. `ImageProxy` acts as a stand-in for `RealImage`, delaying the loading until needed
4. Client code works with either type transparently

**When to use**:
- When you need lazy initialization (creating an object on first use)
- When you need access control to the original object
- When you need to add a layer of functionality before or after the primary object

**Considerations**:
- In Python, `__getattr__` and properties can often implement proxy-like behavior more simply
- Too many proxies can increase system complexity
- Python's dynamic nature allows for more flexible proxy implementations than in strongly typed languages

### Façade Pattern

**First Principles**: The Façade pattern provides a simplified interface to a complex subsystem. It doesn't hide the subsystem but provides a higher-level interface that makes the subsystem easier to use.

#### Example: Video Conversion Façade

```python
# Complex subsystem components
class VideoFile:
    def __init__(self, filename):
        self.filename = filename
        self.codec = filename.split(".")[1]
    
    def get_codec(self):
        return self.codec

class CompressionCodec:
    def __init__(self, type):
        self.type = type

class MPEG4CompressionCodec(CompressionCodec):
    def __init__(self):
        super().__init__("mp4")

class OggCompressionCodec(CompressionCodec):
    def __init__(self):
        super().__init__("ogg")

class CodecFactory:
    @staticmethod
    def extract_codec(file):
        codec = file.get_codec()
        if codec == "mp4":
            return MPEG4CompressionCodec()
        else:
            return OggCompressionCodec()

class BitrateReader:
    @staticmethod
    def read(filename, codec):
        print(f"Reading file {filename} with codec {codec.type}...")
        return f"Raw video data from {filename}"
    
    @staticmethod
    def convert(buffer, codec):
        print(f"Converting buffer to {codec.type}...")
        return f"{buffer} - converted to {codec.type}"

class AudioMixer:
    @staticmethod
    def fix(video):
        print("Fixing audio...")
        return f"{video} - with fixed audio"

# Façade
class VideoConverter:
    def convert(self, filename, target_format):
        file = VideoFile(filename)
        source_codec = CodecFactory.extract_codec(file)
        if target_format == "mp4":
            destination_codec = MPEG4CompressionCodec()
        else:
            destination_codec = OggCompressionCodec()
        
        buffer = BitrateReader.read(filename, source_codec)
        intermediate = BitrateReader.convert(buffer, destination_codec)
        result = AudioMixer.fix(intermediate)
        
        return f"{filename} converted to {target_format}: {result}"

# Client code
converter = VideoConverter()
result = converter.convert("birthday.ogg", "mp4")
print(result)
```

In this example:
1. We have a complex video conversion subsystem with multiple interacting classes
2. The `VideoConverter` façade provides a simple `convert` method that handles all the complexity
3. Clients only need to interact with the façade, not with all the subsystem components

**When to use**:
- When you need to provide a simple interface to a complex subsystem
- When you want to layer your subsystems and provide entry points at each layer
- When you want to reduce coupling between client code and a subsystem

**Considerations**:
- Façades don't prevent clients from using the subsystem directly if needed
- A façade can become a "god object" coupled with too many classes
- Python's simpler syntax often makes façades more compact than in other languages

### Composite Pattern

**First Principles**: The Composite pattern composes objects into tree structures to represent part-whole hierarchies. It lets clients treat individual objects and compositions of objects uniformly.

#### Example: File System Representation

```python
from abc import ABC, abstractmethod

# Component interface
class FileSystemComponent(ABC):
    @abstractmethod
    def get_size(self):
        pass
    
    @abstractmethod
    def print(self, indent=""):
        pass

# Leaf
class File(FileSystemComponent):
    def __init__(self, name, size):
        self.name = name
        self.size = size
    
    def get_size(self):
        return self.size
    
    def print(self, indent=""):
        print(f"{indent}File: {self.name}, Size: {self.size} KB")

# Composite
class Directory(FileSystemComponent):
    def __init__(self, name):
        self.name = name
        self.children = []
    
    def add(self, component):
        self.children.append(component)
        return self
    
    def remove(self, component):
        self.children.remove(component)
        return self
    
    def get_size(self):
        total_size = 0
        for child in self.children:
            total_size += child.get_size()
        return total_size
    
    def print(self, indent=""):
        print(f"{indent}Directory: {self.name}, Size: {self.get_size()} KB")
        for child in self.children:
            child.print(indent + "  ")

# Client code
root = Directory("root")
documents = Directory("documents")
pictures = Directory("pictures")

root.add(documents).add(pictures)

documents.add(File("resume.pdf", 500))
documents.add(File("cover_letter.docx", 200))

pictures.add(File("vacation.jpg", 2000))
pictures.add(File("family.png", 1500))

# We can work with the whole structure or parts of it
root.print()
print(f"Total size: {root.get_size()} KB")

documents.print()
print(f"Documents size: {documents.get_size()} KB")
```

In this example:
1. We define a common `FileSystemComponent` interface
2. `File` represents a leaf node (with no children)
3. `Directory` is a composite that can contain both files and subdirectories
4. Clients can work with individual components or entire trees using the same interface

**When to use**:
- When you want to represent part-whole hierarchies of objects
- When you want clients to ignore the difference between compositions of objects and individual objects
- When the structure can have multiple levels of nesting

**Considerations**:
- The pattern makes it easier to add new types of components
- Can sometimes make the design too general, when you actually want to restrict certain operations
- In Python, duck typing can reduce the need for formal component interfaces

### Bridge Pattern

**First Principles**: The Bridge pattern separates an abstraction from its implementation so that the two can vary independently. It's about separating an interface from its implementation.

#### Example: Drawing Shapes with Different Renderers

```python
from abc import ABC, abstractmethod

# Implementor
class Renderer(ABC):
    @abstractmethod
    def render_circle(self, radius):
        pass
    
    @abstractmethod
    def render_square(self, side):
        pass

# Concrete Implementors
class VectorRenderer(Renderer):
    def render_circle(self, radius):
        return f"Drawing a circle of radius {radius} in vector format"
    
    def render_square(self, side):
        return f"Drawing a square with side {side} in vector format"

class RasterRenderer(Renderer):
    def render_circle(self, radius):
        return f"Drawing a circle of radius {radius} as pixels"
    
    def render_square(self, side):
        return f"Drawing a square with side {side} as pixels"

# Abstraction
class Shape(ABC):
    def __init__(self, renderer):
        self.renderer = renderer
    
    @abstractmethod
    def draw(self):
        pass

# Refined Abstractions
class Circle(Shape):
    def __init__(self, renderer, radius):
        super().__init__(renderer)
        self.radius = radius
    
    def draw(self):
        return self.renderer.render_circle(self.radius)

class Square(Shape):
    def __init__(self, renderer, side):
        super().__init__(renderer)
        self.side = side
    
    def draw(self):
        return self.renderer.render_square(self.side)

# Client code
vector_renderer = VectorRenderer()
raster_renderer = RasterRenderer()

circle1 = Circle(vector_renderer, 5)
circle2 = Circle(raster_renderer, 5)
square = Square(vector_renderer, 10)

print(circle1.draw())  # "Drawing a circle of radius 5 in vector format"
print(circle2.draw())  # "Drawing a circle of radius 5 as pixels"
print(square.draw())   # "Drawing a square with side 10 in vector format"
```

In this example:
1. We define a `Renderer` interface and concrete implementations (`VectorRenderer`, `RasterRenderer`)
2. We create a `Shape` abstraction that references a renderer
3. We implement concrete shapes (`Circle`, `Square`) that use the renderer
4. This separation allows us to combine any shape with any renderer independently

**When to use**:
- When you want to avoid a permanent binding between an abstraction and its implementation
- When both the abstraction and its implementation should be extensible by subclassing
- When changes in the implementation shouldn't impact the client code

**Considerations**:
- Increases complexity by creating more classes
- Results in a more loosely coupled system that's easier to extend
- In Python, dependency injection can sometimes achieve similar goals with less formality

### Flyweight Pattern

**First Principles**: The Flyweight pattern minimizes memory usage by sharing as much data as possible with similar objects. It separates intrinsic state (shared) from extrinsic state (context-dependent) to support large numbers of fine-grained objects efficiently.

#### Example: Text Formatting

```python
import string

# Flyweight (intrinsic state)
class Character:
    # Shared character data
    def __init__(self, symbol):
        self.symbol = symbol

# Flyweight Factory
class CharacterFactory:
    _characters = {}
    
    @classmethod
    def get_character(cls, symbol):
        # Return an existing character if it exists, otherwise create a new one
        if symbol not in cls._characters:
            cls._characters[symbol] = Character(symbol)
        return cls._characters[symbol]

# Context that uses the flyweights (with extrinsic state)
class TextEditor:
    def __init__(self):
        self.characters = []
    
    def add(self, symbol, font_name, font_size):
        # Get the flyweight
        character = CharacterFactory.get_character(symbol)
        # Store the character along with its context-specific state
        self.characters.append({
            'character': character,
            'font_name': font_name,
            'font_size': font_size,
            'position': len(self.characters)
        })
    
    def render(self):
        result = []
        for char_data in self.characters:
            char = char_data['character']
            result.append(
                f"Character '{char.symbol}' at position {char_data['position']} "
                f"with {char_data['font_name']} font, size {char_data['font_size']}"
            )
        return "\n".join(result)

# Client code
editor = TextEditor()

# Add many characters with different formatting
editor.add('H', 'Arial', 12)
editor.add('e', 'Arial', 12)
editor.add('l', 'Arial', 12)
editor.add('l', 'Arial', 12)  # Reuses the 'l' character
editor.add('o', 'Arial', 12)
editor.add(' ', 'Arial', 12)
editor.add('W', 'Times New Roman', 14)
editor.add('o', 'Times New Roman', 14)  # Reuses the 'o' character
editor.add('r', 'Times New Roman', 14)
editor.add('l', 'Times New Roman', 14)  # Reuses the 'l' character
editor.add('d', 'Times New Roman', 14)

print(editor.render())
print(f"Number of unique characters: {len(CharacterFactory._characters)}")
```

In this example:
1. `Character` is a flyweight that stores only the intrinsic state (the symbol)
2. `CharacterFactory` ensures we reuse characters when possible
3. `TextEditor` stores the extrinsic state (font, size, position) separately from the flyweights
4. We can have thousands of character instances while only storing a small number of actual `Character` objects

**When to use**:
- When you need to support a large number of objects that would otherwise consume too much memory
- When many objects can share parts of their state
- When you can replace many groups of objects with relatively few shared objects

**Considerations**:
- Optimization pattern - use only when you need to save memory
- Adds complexity to your code
- Thread safety needs to be considered for flyweight factories

## Behavioral Patterns

### Observer Pattern

**First Principles**: The Observer pattern defines a one-to-many dependency between objects, so when one object changes state, all its dependents are notified and updated automatically.

#### Example: Weather Station

```python
from abc import ABC, abstractmethod

# Subject interface
class Subject(ABC):
    @abstractmethod
    def attach(self, observer):
        pass
    
    @abstractmethod
    def detach(self, observer):
        pass
    
    @abstractmethod
    def notify(self):
        pass

# Observer interface
class Observer(ABC):
    @abstractmethod
    def update(self, temperature, humidity, pressure):
        pass

# Concrete Subject
class WeatherStation(Subject):
    def __init__(self):
        self._observers = []
        self._temperature = 0
        self._humidity = 0
        self._pressure = 0
    
    def attach(self, observer):
        if observer not in self._observers:
            self._observers.append(observer)
    
    def detach(self, observer):
        self._observers.remove(observer)
    
    def notify(self):
        for observer in self._observers:
            observer.update(self._temperature, self._humidity, self._pressure)
    
    def set_measurements(self, temperature, humidity, pressure):
        self._temperature = temperature
        self._humidity = humidity
        self._pressure = pressure
        self.notify()  # Notify observers of state change

# Concrete Observers
class TemperatureDisplay(Observer):
    def update(self, temperature, humidity, pressure):
        print(f"Temperature Display: {temperature}°C")

class WeatherStatsDisplay(Observer):
    def __init__(self):
        self.temperature_sum = 0
        self.reading_count = 0
    
    def update(self, temperature, humidity, pressure):
        self.temperature_sum += temperature
        self.reading_count += 1
        avg = self.temperature_sum / self.reading_count
        print(f"Weather Stats: Average temperature is {avg:.1f}°C")

# Client code
weather_station = WeatherStation()

temp_display = TemperatureDisplay()
stats_display = WeatherStatsDisplay()

weather_station.attach(temp_display)
weather_station.attach(stats_display)

# Simulate weather changes
weather_station.set_measurements(25, 65, 1013)
# Output:
# Temperature Display: 25°C
# Weather Stats: Average temperature is 25.0°C

weather_station.set_measurements(26, 70, 1014)
# Output:
# Temperature Display: 26°C
# Weather Stats: Average temperature is 25.5°C

# Remove an observer
weather_station.detach(temp_display)

weather_station.set_measurements(27, 75, 1015)
# Output:
# Weather Stats: Average temperature is 26.0°C
```

In this example:
1. We define `Subject` and `Observer` interfaces
2. `WeatherStation` is a concrete subject that maintains a list of observers and notifies them of changes
3. `TemperatureDisplay` and `WeatherStatsDisplay` are concrete observers that respond to updates
4. When the weather station's measurements change, all registered observers are notified

**When to use**:
- When changes to one object require changing others, and you don't know how many objects need to change
- When an object should be able to notify other objects without making assumptions about those objects
- When you want to build a loose coupling between related objects

**Considerations**:
- Python's standard library includes an `Observable` module (deprecated but still useful)
- Event systems and callbacks can sometimes be simpler alternatives
- Be careful about memory leaks if observers aren't properly detached

### Strategy Pattern

**First Principles**: The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets the algorithm vary independently from clients that use it.

#### Example: Payment Strategies

```python
from abc import ABC, abstractmethod

# Strategy interface
class PaymentStrategy(ABC):
    @abstractmethod
    def pay(self, amount):
        pass

# Concrete strategies
class CreditCardPayment(PaymentStrategy):
    def __init__(self, card_number, name, exp_date, cvv):
        self.card_number = card_number
        self.name = name
        self.exp_date = exp_date
        self.cvv = cvv
    
    def pay(self, amount):
        return f"Paid ${amount} using Credit Card ending with {self.card_number[-4:]}"

class PayPalPayment(PaymentStrategy):
    def __init__(self, email, password):
        self.email = email
        self.password = password  # In a real app, never store passwords like this
    
    def pay(self, amount):
        return f"Paid ${amount} using PayPal account {self.email}"

class BankTransferPayment(PaymentStrategy):
    def __init__(self, account_number, bank_code):
        self.account_number = account_number
        self.bank_code = bank_code
    
    def pay(self, amount):
        return f"Paid ${amount} using Bank Transfer from account {self.account_number}"

# Context
class ShoppingCart:
    def __init__(self):
        self.items = []
    
    def add_item(self, item, price):
        self.items.append({"item": item, "price": price})
    
    def calculate_total(self):
        return sum(item["price"] for item in self.items)
    
    def checkout(self, payment_strategy):
        amount = self.calculate_total()
        return payment_strategy.pay(amount)

# Client code
cart = ShoppingCart()
cart.add_item("Book", 15)
cart.add_item("Headphones", 100)

# Pay with credit card
cc_payment = CreditCardPayment("1234567890123456", "John Doe", "12/25", "123")
print(cart.checkout(cc_payment))  # "Paid $115 using Credit Card ending with 3456"

# Pay with PayPal
paypal_payment = PayPalPayment("john@example.com", "password123")
print(cart.checkout(paypal_payment))  # "Paid $115 using PayPal account john@example.com"

# Using a function as a strategy (Python-specific approach)
def cash_payment_strategy(amount):
    return f"Paid ${amount} using Cash"

# In Python, we can also use functions as strategies due to first-class functions
print(cart.checkout(lambda amount: f"Paid ${amount} using Cash"))  # "Paid $115 using Cash"
```

In this example:
1. We define a `PaymentStrategy` interface and concrete implementations
2. The `ShoppingCart` context uses the selected strategy to perform payment
3. Clients can switch strategies at runtime
4. We also show a Python-specific approach using functions as strategies

**When to use**:
- When you want to define a family of algorithms, encapsulate each one, and make them interchangeable
- When you need different variants of an algorithm
- When you want to avoid exposing complex algorithm-specific data structures

**Considerations**:
- In Python, you can often use simple functions instead of strategy classes
- Increases the number of objects in your application
- Provides a good alternative to using multiple conditional statements

### Command Pattern

**First Principles**: The Command pattern encapsulates a request as an object, letting you parameterize clients with different requests, queue or log requests, and support undoable operations.

#### Example: Text Editor Commands

```python
from abc import ABC, abstractmethod

# Command interface
class Command(ABC):
    @abstractmethod
    def execute(self):
        pass
    
    @abstractmethod
    def undo(self):
        pass

# Receiver
class TextEditor:
    def __init__(self):
        self.text = ""
    
    def insert_text(self, text):
        self.text += text
    
    def delete_text(self, length):
        if length <= len(self.text):
            deleted = self.text[-length:]
            self.text = self.text[:-length]
            return deleted
        return ""
    
    def get_text(self):
        return self.text

# Concrete Commands
class InsertTextCommand(Command):
    def __init__(self, editor, text):
        self.editor = editor
        self.text = text
    
    def execute(self):
        self.editor.insert_text(self.text)
    
    def undo(self):
        self.editor.delete_text(len(self.text))

class DeleteTextCommand(Command):
    def __init__(self, editor, length):
        self.editor = editor
        self.length = length
        self.deleted_text = ""
    
    def execute(self):
        self.deleted_text = self.editor.delete_text(self.length)
    
    def undo(self):
        self.editor.insert_text(self.deleted_text)

# Invoker
class CommandHistory:
    def __init__(self):
        self.history = []
    
    def execute(self, command):
        command.execute()
        self.history.append(command)
    
    def undo_last(self):
        if self.history:
            command = self.history.pop()
            command.undo()

# Client code
editor = TextEditor()
history = CommandHistory()

# Execute commands
insert_command = InsertTextCommand(editor, "Hello, ")
history.execute(insert_command)

insert_command2 = InsertTextCommand(editor, "World!")
history.execute(insert_command2)

print(editor.get_text())  # "Hello, World!"

# Undo last command
history.undo_last()
print(editor.get_text())  # "Hello, "

# Execute another command
insert_command3 = InsertTextCommand(editor, "Python!")
history.execute(insert_command3)
print(editor.get_text())  # "Hello, Python!"

# Undo again
history.undo_last()
print(editor.get_text())  # "Hello, "
```

In this example:
1. We define a `Command` interface with `execute()` and `undo()` methods
2. `TextEditor` is the receiver that performs the actual operations
3. `InsertTextCommand` and `DeleteTextCommand` are concrete commands that work with the editor
4. `CommandHistory` is the invoker that executes commands and maintains a history for undoing
5. Client code creates commands and passes them to the invoker

**When to use**:
- When you need to parameterize objects with operations
- When you want to queue operations, schedule their execution, or execute them remotely
- When you need to implement reversible operations
- When you want to structure a system around high-level operations built on primitive operations

**Considerations**:
- Decouples the object that invokes the operation from the one that knows how to perform it
- Commands can be extended to support complex composite commands
- Python's first-class functions can sometimes replace simple command objects

### Template Method Pattern

**First Principles**: The Template Method pattern defines the skeleton of an algorithm in a method, deferring some steps to subclasses. It lets subclasses redefine certain steps of an algorithm without changing the algorithm's structure.

#### Example: Document Processing

```python
from abc import ABC, abstractmethod

# Abstract class with template method
class DocumentProcessor(ABC):
    def process_document(self, document):
        """
        The template method defines the skeleton of the algorithm.
        """
        content = self.parse(document)
        modified_content = self.analyze(content)
        structured_data = self.structure(modified_content)
        return self.format(structured_data)
    
    @abstractmethod
    def parse(self, document):
        """Extract raw content from the document."""
        pass
    
    def analyze(self, content):
        """
        Analyze the content - this is a hook method that
        subclasses might override but don't have to.
        """
        return content
    
    @abstractmethod
    def structure(self, content):
        """Convert content into a structured format."""
        pass
    
    @abstractmethod
    def format(self, data):
        """Format the structured data for output."""
        pass

# Concrete implementations
class PDFProcessor(DocumentProcessor):
    def parse(self, document):
        print("Parsing PDF document...")
        return f"Content from PDF: {document}"
    
    def structure(self, content):
        print("Structuring PDF content...")
        return {"type": "pdf", "content": content}
    
    def format(self, data):
        print("Formatting PDF data...")
        return f"Formatted PDF: {data['content']}"

class HTMLProcessor(DocumentProcessor):
    def parse(self, document):
        print("Parsing HTML document...")
        return f"Content from HTML: {document}"
    
    def analyze(self, content):
        print("Analyzing HTML content...")
        return content + " (analyzed)"
    
    def structure(self, content):
        print("Structuring HTML content...")
        return {"type": "html", "content": content}
    
    def format(self, data):
        print("Formatting HTML data...")
        return f"Formatted HTML: {data['content']}"

# Client code
pdf_processor = PDFProcessor()
result = pdf_processor.process_document("Annual Report 2023.pdf")
print(result)

print("\n")

html_processor = HTMLProcessor()
result = html_processor.process_document("<html>Hello World</html>")
print(result)
```

In this example:
1. `DocumentProcessor` defines a template method (`process_document`) that outlines the algorithm
2. The template method calls several abstract methods that subclasses must implement
3. It also includes a hook method (`analyze`) that subclasses can optionally override
4. `PDFProcessor` and `HTMLProcessor` provide concrete implementations of the required methods
5. Each processor follows the same algorithm structure but implements steps differently

**When to use**:
- When you want to implement the invariant parts of an algorithm once and leave the variant parts to subclasses
- When common behavior among subclasses should be factored into a common class
- When you want to control the extension points available to subclasses

**Considerations**:
- Templates reduce code duplication
- They can enforce a certain protocol or structure
- In Python, abstract base classes (`abc` module) help enforce the template structure

### State Pattern

**First Principles**: The State pattern allows an object to alter its behavior when its internal state changes. The object will appear to change its class.

#### Example: Media Player

```python
from abc import ABC, abstractmethod

# State interface
class PlayerState(ABC):
    @abstractmethod
    def play(self, player):
        pass
    
    @abstractmethod
    def pause(self, player):
        pass
    
    @abstractmethod
    def stop(self, player):
        pass

# Concrete States
class StoppedState(PlayerState):
    def play(self, player):
        player.change_state(PlayingState())
        return "Starting playback"
    
    def pause(self, player):
        return "Can't pause when stopped"
    
    def stop(self, player):
        return "Already stopped"

class PlayingState(PlayerState):
    def play(self, player):
        return "Already playing"
    
    def pause(self, player):
        player.change_state(PausedState())
        return "Pausing playback"
    
    def stop(self, player):
        player.change_state(StoppedState())
        return "Stopping playback"

class PausedState(PlayerState):
    def play(self, player):
        player.change_state(PlayingState())
        return "Resuming playback"
    
    def pause(self, player):
        return "Already paused"
    
    def stop(self, player):
        player.change_state(StoppedState())
        return "Stopping playback"

# Context
class MediaPlayer:
    def __init__(self):
        self.state = StoppedState()
    
    def change_state(self, state):
        self.state = state
    
    def play(self):
        return self.state.play(self)
    
    def pause(self):
        return self.state.pause(self)
    
    def stop(self):
        return self.state.stop(self)

# Client code
player = MediaPlayer()

print(player.play())   # "Starting playback"
print(player.play())   # "Already playing"
print(player.pause())  # "Pausing playback"
print(player.play())   # "Resuming playback"
print(player.stop())   # "Stopping playback"
print(player.pause())  # "Can't pause when stopped"
```

In this example:
1. `PlayerState` defines the interface for all concrete states
2. We implement three concrete states: `StoppedState`, `PlayingState`, and `PausedState`
3. `MediaPlayer` is the context that maintains a reference to the current state and delegates state-specific behavior
4. When an action is performed, the current state might change the context's state to a different one
5. From the client's perspective, the player appears to change its behavior based on its state

**When to use**:
- When an object's behavior depends on its state, and it must change behavior at runtime
- When operations have large, multipart conditional statements that depend on the object's state
- When transitions between states need to be explicit and well-defined

**Considerations**:
- Localizes state-specific behavior in separate classes
- Makes state transitions explicit
- Can result in many small classes, but makes the state logic clearer

### Chain of Responsibility Pattern

**First Principles**: The Chain of Responsibility pattern passes requests along a chain of handlers. Each handler decides either to process the request or to pass it to the next handler in the chain.

#### Example: Request Processing Pipeline

```python
from abc import ABC, abstractmethod

# Handler interface
class Handler(ABC):
    def __init__(self):
        self.next_handler = None
    
    def set_next(self, handler):
        self.next_handler = handler
        return handler  # Return for chaining
    
    def handle(self, request):
        result = self.process(request)
        if result is None and self.next_handler:
            return self.next_handler.handle(request)
        return result
    
    @abstractmethod
    def process(self, request):
        pass

# Concrete Handlers
class AuthenticationHandler(Handler):
    def process(self, request):
        if not request.get('authenticated'):
            return "Authentication failed"
        return None  # Pass to next handler

class AuthorizationHandler(Handler):
    def process(self, request):
        if request.get('authenticated') and not request.get('authorized'):
            return "Authorization failed"
        return None  # Pass to next handler

class ValidationHandler(Handler):
    def process(self, request):
        if not request.get('data'):
            return "Validation failed: no data provided"
        return None  # Pass to next handler

class RequestProcessor(Handler):
    def process(self, request):
        if request.get('authenticated') and request.get('authorized') and request.get('data'):
            return f"Request processed successfully: {request['data']}"
        return None  # Pass to next handler

# Client code
def create_processing_chain():
    authentication = AuthenticationHandler()
    authorization = AuthorizationHandler()
    validation = ValidationHandler()
    processor = RequestProcessor()
    
    # Chain the handlers
    authentication.set_next(authorization).set_next(validation).set_next(processor)
    
    return authentication  # Return the first handler in the chain

# Create the chain
chain = create_processing_chain()

# Process various requests
requests = [
    {},  # Missing authentication
    {'authenticated': True},  # Missing authorization
    {'authenticated': True, 'authorized': True},  # Missing data
    {'authenticated': True, 'authorized': True, 'data': 'Sample payload'}  # Complete request
]

for i, request in enumerate(requests):
    print(f"Request {i+1}:", chain.handle(request))
```

In this example:
1. We define a `Handler` interface with methods to set the next handler and handle requests
2. We implement concrete handlers for different aspects of request processing: authentication, authorization, validation, and processing
3. Each handler either returns a result or passes the request to the next handler
4. We chain the handlers together and process various requests through the chain

**When to use**:
- When more than one object may handle a request, and the handler isn't known in advance
- When you want to issue a request to one of several objects without specifying the receiver explicitly
- When the set of objects that can handle a request should be specified dynamically

**Considerations**:
- Decouples the sender from the receiver
- Provides flexibility in assigning responsibilities to objects
- No guarantee that a request will be handled
- In Python, decorators can sometimes be used to implement this pattern more elegantly

### Memento Pattern

**First Principles**: The Memento pattern captures and externalizes an object's internal state without violating encapsulation, so the object can be restored to this state later.

#### Example: Text Editor with Undo

```python
# Memento - stores the state
class EditorMemento:
    def __init__(self, content):
        # Store content privately
        self._content = content
    
    def get_content(self):
        return self._content

# Originator - the object whose state we want to save
class Editor:
    def __init__(self):
        self.content = ""
    
    def type(self, text):
        self.content += text
    
    def get_content(self):
        return self.content
    
    def save(self):
        # Create a memento with the current state
        return EditorMemento(self.content)
    
    def restore(self, memento):
        # Restore from a memento
        self.content = memento.get_content()

# Caretaker - manages the mementos without examining their contents
class History:
    def __init__(self):
        self.history = []
    
    def push(self, memento):
        self.history.append(memento)
    
    def pop(self):
        if self.history:
            return self.history.pop()
        return None

# Client code
editor = Editor()
history = History()

# Initial state
editor.type("This is the first sentence. ")
print("Current content:", editor.get_content())

# Save the state
history.push(editor.save())

# Make changes
editor.type("This is the second sentence. ")
print("Current content:", editor.get_content())

# Save the state again
history.push(editor.save())

# Make more changes
editor.type("This is the third sentence. ")
print("Current content:", editor.get_content())

# Undo (restore the previous state)
editor.restore(history.pop())
print("After first undo:", editor.get_content())

# Undo again
editor.restore(history.pop())
print("After second undo:", editor.get_content())
```

In this example:
1. `EditorMemento` stores the state of the editor
2. `Editor` is the originator that creates mementos and can restore its state from them
3. `History` is the caretaker that keeps track of the mementos
4. Client code uses the editor, saves states, and performs undo operations by restoring previous states

**When to use**:
- When you need to capture an object's internal state to restore it later
- When direct access to an object's state would violate encapsulation
- When you need to implement undo functionality

**Considerations**:
- Can be memory-intensive if objects are large or states change frequently
- In Python, pickle or deepcopy can sometimes be used for simple memento implementations
- Consider using a more efficient approach for storing just the differences between states

### Iterator Pattern

**First Principles**: The Iterator pattern provides a way to access elements of an aggregate object sequentially without exposing its underlying representation.

#### Example: Custom Collection with Iterator

```python
from collections.abc import Iterator, Iterable

# Concrete Iterator
class TreeIterator(Iterator):
    def __init__(self, tree):
        self.tree = tree
        self.index = 0
        # Flatten the tree structure
        self.values = []
        self._flatten(tree.root)
    
    def _flatten(self, node):
        if node is None:
            return
        self._flatten(node.left)
        self.values.append(node.value)
        self._flatten(node.right)
    
    def __next__(self):
        if self.index < len(self.values):
            value = self.values[self.index]
            self.index += 1
            return value
        raise StopIteration

# Node for our binary tree
class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

# Concrete Collection (Iterable)
class BinaryTree(Iterable):
    def __init__(self):
        self.root = None
    
    def add(self, value):
        if self.root is None:
            self.root = Node(value)
        else:
            self._add_recursive(self.root, value)
    
    def _add_recursive(self, node, value):
        if value < node.value:
            if node.left is None:
                node.left = Node(value)
            else:
                self._add_recursive(node.left, value)
        else:
            if node.right is None:
                node.right = Node(value)
            else:
                self._add_recursive(node.right, value)
    
    def __iter__(self):
        return TreeIterator(self)

# Using Python's built-in iteration support
def demonstrate_python_iteration():
    # Create a tree and add elements
    tree = BinaryTree()
    tree.add(5)
    tree.add(3)
    tree.add(7)
    tree.add(2)
    tree.add(4)
    tree.add(6)
    tree.add(8)
    
    # Use our custom iterator
    print("Using custom iterator:")
    for value in tree:
        print(value, end=' ')
    print()
    
    # This is possible because we implemented __iter__
    
    # We can also use it in other contexts that expect iterables
    print("In-order elements as a list:", list(tree))
    print("Sum of elements:", sum(tree))
    print("Maximum element:", max(tree))

demonstrate_python_iteration()
```

In this example:
1. We implement a binary tree with nodes
2. We create a custom iterator (`TreeIterator`) that traverses the tree in in-order
3. The `BinaryTree` class implements the `Iterable` interface, returning an instance of our iterator
4. Client code can use the tree with Python's iteration syntax (`for` loops, `list()`, etc.)

**When to use**:
- When you want to access a collection's contents without exposing its internal structure
- When you want to support multiple traversal methods for a collection
- When you want to provide a uniform interface for traversing different collection types

**Considerations**:
- Python has built-in iteration protocols (`__iter__` and `__next__`)
- Generator functions with `yield` often provide a simpler alternative
- The pattern decouples algorithms from container classes

### Visitor Pattern

**First Principles**: The Visitor pattern lets you define a new operation without changing the classes of the elements on which it operates. It's useful when you need to perform operations across a disparate set of objects.

#### Example: Document Object Model (DOM) Processing

```python
from abc import ABC, abstractmethod

# Element Interface
class Element(ABC):
    @abstractmethod
    def accept(self, visitor):
        pass

# Concrete Elements
class Paragraph(Element):
    def __init__(self, text):
        self.text = text
    
    def accept(self, visitor):
        return visitor.visit_paragraph(self)

class Heading(Element):
    def __init__(self, level, text):
        self.level = level
        self.text = text
    
    def accept(self, visitor):
        return visitor.visit_heading(self)

class Link(Element):
    def __init__(self, url, text):
        self.url = url
        self.text = text
    
    def accept(self, visitor):
        return visitor.visit_link(self)

# Visitor Interface
class Visitor(ABC):
    @abstractmethod
    def visit_paragraph(self, paragraph):
        pass
    
    @abstractmethod
    def visit_heading(self, heading):
        pass
    
    @abstractmethod
    def visit_link(self, link):
        pass

# Concrete Visitors
class HTMLExportVisitor(Visitor):
    def visit_paragraph(self, paragraph):
        return f"<p>{paragraph.text}</p>"
    
    def visit_heading(self, heading):
        return f"<h{heading.level}>{heading.text}</h{heading.level}>"
    
    def visit_link(self, link):
        return f"<a href=\"{link.url}\">{link.text}</a>"

class MarkdownExportVisitor(Visitor):
    def visit_paragraph(self, paragraph):
        return paragraph.text
    
    def visit_heading(self, heading):
        return "#" * heading.level + " " + heading.text
    
    def visit_link(self, link):
        return f"[{link.text}]({link.url})"

class TextLengthVisitor(Visitor):
    def visit_paragraph(self, paragraph):
        return len(paragraph.text)
    
    def visit_heading(self, heading):
        return len(heading.text)
    
    def visit_link(self, link):
        return len(link.text)

# Document Structure
class Document:
    def __init__(self):
        self.elements = []
    
    def add(self, element):
        self.elements.append(element)
    
    def accept(self, visitor):
        results = []
        for element in self.elements:
            results.append(element.accept(visitor))
        return results

# Client code
doc = Document()
doc.add(Heading(1, "Visitor Pattern"))
doc.add(Paragraph("The visitor pattern allows adding operations to a structure without modifying it."))
doc.add(Link("https://example.com", "Learn More"))

# Export to HTML
html_visitor = HTMLExportVisitor()
html_output = doc.accept(html_visitor)
print("HTML Output:")
for html in html_output:
    print(html)

# Export to Markdown
md_visitor = MarkdownExportVisitor()
md_output = doc.accept(md_visitor)
print("\nMarkdown Output:")
for md in md_output:
    print(md)

# Calculate text length
length_visitor = TextLengthVisitor()
length_output = doc.accept(length_visitor)
print("\nText Lengths:")
for i, length in enumerate(length_output):
    print(f"Element {i+1}: {length} characters")
```

In this example:
1. We define an `Element` interface with an `accept` method
2. We implement concrete elements (`Paragraph`, `Heading`, `Link`)
3. We define a `Visitor` interface with visit methods for each element type
4. We implement concrete visitors for different operations (HTML export, Markdown export, text length calculation)
5. The `Document` class manages a collection of elements
6. Client code creates a document and applies different visitors to it

**When to use**:
- When you need to perform operations on all elements of a complex object structure (like a composite)
- When you want to add new operations to existing object structures without modifying them
- When the object structure classes rarely change, but you often want to define new operations on the structure

**Considerations**:
- Python's lack of method overloading makes classic visitor implementations verbose
- `isinstance()` checks can sometimes replace the pattern in Python
- Can violate encapsulation by requiring visitors to know details of the elements

### Interpreter Pattern

**First Principles**: The Interpreter pattern defines a representation for a grammar and an interpreter that uses the representation to interpret sentences in the language.

#### Example: Simple Expression Evaluator

```python
from abc import ABC, abstractmethod

# Abstract Expression
class Expression(ABC):
    @abstractmethod
    def interpret(self, context):
        pass

# Terminal Expressions
class NumberExpression(Expression):
    def __init__(self, value):
        self.value = value
    
    def interpret(self, context):
        return self.value

class VariableExpression(Expression):
    def __init__(self, name):
        self.name = name
    
    def interpret(self, context):
        if self.name not in context:
            return 0
        return context[self.name]

# Non-terminal Expressions
class AddExpression(Expression):
    def __init__(self, left, right):
        self.left = left
        self.right = right
    
    def interpret(self, context):
        return self.left.interpret(context) + self.right.interpret(context)

class SubtractExpression(Expression):
    def __init__(self, left, right):
        self.left = left
        self.right = right
    
    def interpret(self, context):
        return self.left.interpret(context) - self.right.interpret(context)

class MultiplyExpression(Expression):
    def __init__(self, left, right):
        self.left = left
        self.right = right
    
    def interpret(self, context):
        return self.left.interpret(context) * self.right.interpret(context)

# Client code - Parse and evaluate expressions
def create_expression_tree():
    # Build an expression tree for: (x + 5) * (10 - y)
    x = VariableExpression('x')
    five = NumberExpression(5)
    add = AddExpression(x, five)
    
    ten = NumberExpression(10)
    y = VariableExpression('y')
    subtract = SubtractExpression(ten, y)
    
    multiply = MultiplyExpression(add, subtract)
    
    return multiply

# Interpret the expression with different contexts
expression = create_expression_tree()

context1 = {'x': 10, 'y': 2}
result1 = expression.interpret(context1)
print(f"(x + 5) * (10 - y) with x=10, y=2: {result1}")  # (10 + 5) * (10 - 2) = 15 * 8 = 120

context2 = {'x': 5, 'y': 7}
result2 = expression.interpret(context2)
print(f"(x + 5) * (10 - y) with x=5, y=7: {result2}")  # (5 + 5) * (10 - 7) = 10 * 3 = 30
```

In this example:
1. We define an `Expression` interface
2. We implement terminal expressions (`NumberExpression`, `VariableExpression`)
3. We implement non-terminal expressions (`AddExpression`, `SubtractExpression`, `MultiplyExpression`)
4. We build an expression tree to represent a formula: (x + 5) * (10 - y)
5. We interpret the expression with different variable contexts

**When to use**:
- When you need to interpret a language or domain-specific language (DSL)
- When you have a grammar that can be represented as an abstract syntax tree
- When efficiency is not a critical concern

**Considerations**:
- Complex grammars can lead to many classes and a complex hierarchy
- Can be inefficient for complex interpretations
- Better suited for simple languages or expressions
- In Python, libraries like `ast` and tools like parser generators might be more appropriate for complex languages

## Comparative Analysis

### Creational Patterns Comparison

| Pattern | Intent | Pros | Cons | When to Use |
|---------|--------|------|------|------------|
| Singleton | Ensure a class has only one instance | Global access point, controls instantiation | Introduces global state, harder to test | Resource managers, caches, thread pools |
| Factory Method | Define interface for creating objects, letting subclasses decide which class to instantiate | Decouples creation from usage, extensible | Can lead to many subclasses | When object creation logic should be separated from usage |
| Builder | Separate construction from representation | Constructs complex objects step by step, allows different representations | Adds complexity with extra classes | Complex objects with many optional components |
| Prototype | Create objects by copying existing ones | Creates objects without coupling to their classes | Can be tricky with complex object graphs | When creating new objects is expensive |
| Abstract Factory | Create families of related objects | Ensures compatibility between products, isolates concrete classes | Complex to implement, hard to add new product types | UI toolkits, cross-platform code |

### Structural Patterns Comparison

| Pattern | Intent | Pros | Cons | When to Use |
|---------|--------|------|------|------------|
| Adapter | Convert interface of a class into another interface | Makes incompatible interfaces work together | Extra layer of indirection | Integrating with legacy code or third-party libraries |
| Decorator | Add responsibilities to objects dynamically | More flexible than inheritance, adds behavior at runtime | Can result in many small objects | When you need to add features without modifying core code |
| Proxy | Provide a surrogate for another object | Controls access to the original object | Extra indirection layer | Lazy loading, access control, logging |
| Façade | Provide simplified interface to a complex subsystem | Hides complexity, promotes loose coupling | Adds a layer | When a subsystem is complex and needs a simpler interface |
| Composite | Compose objects into tree structures | Treat individual objects and compositions uniformly | Can make design too general | Hierarchical structures, part-whole relationships |
| Bridge | Separate abstraction from implementation | Decouples interface from implementation | Increases complexity | When both abstraction and implementation should be extensible |
| Flyweight | Share fine-grained objects efficiently | Reduces memory usage | Complex to implement correctly | Memory-constrained systems with many similar objects |

### Behavioral Patterns Comparison

| Pattern | Intent | Pros | Cons | When to Use |
|---------|--------|------|------|------------|
| Observer | Define one-to-many dependency between objects | Loose coupling, supports broadcast communication | Unexpected updates, potential memory leaks | Event handling systems, MVC architecture |
| Strategy | Define family of algorithms, make them interchangeable | Isolates algorithm implementation, runtime switching | Increases number of objects | When algorithm behavior should vary independently |
| Command | Encapsulate a request as an object | Decouples sender and receiver, supports undoable operations | Proliferation of small classes | GUIs, transactions, command queues |
| Template Method | Define algorithm skeleton, defer steps to subclasses | Reuses common code, enforces structure | Restricts algorithm design to inheritance | When algorithm structure is fixed but steps vary |
| State | Allow an object to alter behavior when state changes | Localizes state-specific behavior, makes transitions explicit | Proliferation of classes | When object behavior depends on its state |
| Chain of Responsibility | Pass request along chain of handlers | Decouples sender and receivers, dynamic handler chain | No guarantee request will be handled | Request processing pipelines, event propagation |
| Memento | Capture and externalize object's state | Preserves encapsulation, provides state history | Can be memory-intensive | Undo mechanisms, snapshots, transactions |
| Iterator | Access elements sequentially without exposing representation | Simplifies client code, supports different traversals | Overkill for simple collections | When collection traversal should be abstracted |
| Visitor | Define new operation without changing element classes | Separates algorithm from object structure, easily add operations | Hard to add new element types | When element classes rarely change but operations do |
| Interpreter | Define a representation for a language grammar | Makes grammar explicit, easy to change/extend | Complex for non-trivial grammars | Domain-specific languages, parsers |

## Decision Guide: Which Pattern to Use?

1. **When you need to control object creation:**
   - For single instances of a class → Singleton
   - To hide creation logic → Factory Method
   - For families of related objects → Abstract Factory
   - For complex objects with many parameters → Builder
   - To create copies of existing objects → Prototype

2. **When you need to adapt or extend functionality:**
   - To make incompatible interfaces work together → Adapter
   - To add responsibilities dynamically → Decorator
   - To control access to an object → Proxy
   - To simplify a complex subsystem → Façade
   - To work with object hierarchies → Composite
   - To decouple interface from implementation → Bridge
   - To manage memory for many similar objects → Flyweight

3. **When you need to manage object behavior and communication:**
   - For one-to-many dependencies → Observer
   - To vary algorithms at runtime → Strategy
   - To encapsulate and queue operations → Command
   - To define algorithm structure with customizable steps → Template Method
   - To vary behavior based on internal state → State
   - To process requests sequentially → Chain of Responsibility
   - To capture and restore object state → Memento
   - To traverse collections → Iterator
   - To add operations to object structures → Visitor
   - To interpret a language → Interpreter

## Python-Specific Considerations

Python's dynamic nature and language features often allow for simpler pattern implementations:

1. **First-class functions** make Strategy and Command patterns simpler
2. **Duck typing** reduces the need for explicit interfaces
3. **Properties** can simplify Proxy and other access control patterns
4. **Decorators** provide a clean syntax for the Decorator pattern
5. **Module-level singletons** can replace the Singleton pattern
6. **Named parameters and defaults** can reduce the need for Builders
7. **Dynamic attribute access** (`__getattr__`, etc.) enables flexible Proxies and Adapters
8. **Generator functions** with `yield` often replace custom Iterators

## Conclusion

Design patterns are powerful tools for solving common design problems. In Python, many patterns can be implemented more simply than in statically typed languages, but the core principles remain valuable. By understanding when and how to apply each pattern, you can create more maintainable, flexible, and robust code.

Remember that patterns should serve your design, not dictate it. Always choose the simplest solution that meets your needs, using patterns when they add value and avoiding them when they add unnecessary complexity.