# The Adapter Pattern in Python: A First Principles Exploration

The Adapter pattern is one of the most practical and widely used structural design patterns. I'll explain it thoroughly from first principles, starting with the fundamental problem it solves and building up to practical implementations with detailed examples.

## The Core Problem: Incompatible Interfaces

At its essence, the Adapter pattern addresses this fundamental challenge: **How can we make classes with incompatible interfaces work together?**

This problem emerges in many real-world software development scenarios:

1. Integrating a third-party library with an existing application
2. Working with legacy code that can't be modified
3. Supporting multiple APIs or standards without changing client code
4. Making objects with different interfaces work with the same system
5. Reusing existing code that doesn't quite fit the current requirements

Without the Adapter pattern, we often resort to writing messy, hard-to-maintain code full of conditionals and special cases. Or worse, we might duplicate functionality that already exists but can't be used directly due to interface incompatibilities.

## The Adapter Pattern: First Principles

The Adapter pattern solves this by introducing a new class (the adapter) that converts the interface of one class (the adaptee) into another interface (the target) that clients expect. The key components are:

1. **Target**: The interface that clients expect to work with
2. **Adaptee**: The existing class with an incompatible interface
3. **Adapter**: The class that bridges the gap between the Target and Adaptee

The core principles behind the Adapter pattern are:

1. **Interface Conversion**: Transform one interface into another without modifying the original code
2. **Encapsulation**: Hide the complexity of the adaptation process from clients
3. **Reusability**: Allow reuse of existing classes despite interface incompatibilities
4. **Separation of Concerns**: Keep the adaptation logic separate from both the client and the adaptee

## Basic Implementation in Python

Let's start with a simple implementation of the Adapter pattern for a media player system:

```python
from abc import ABC, abstractmethod

# Target Interface
class MediaPlayer(ABC):
    @abstractmethod
    def play(self, filename):
        """Play a media file"""
        pass

# Concrete implementation of the Target interface
class AudioPlayer(MediaPlayer):
    def play(self, filename):
        if filename.endswith(".mp3"):
            print(f"Playing MP3 file: {filename}")
        else:
            print(f"Invalid media format for AudioPlayer: {filename}")

# Adaptee (incompatible interface)
class AdvancedMediaPlayer:
    def play_vlc(self, filename):
        print(f"Playing VLC file: {filename}")
  
    def play_mp4(self, filename):
        print(f"Playing MP4 file: {filename}")

# Adapter
class MediaAdapter(MediaPlayer):
    def __init__(self):
        self.advanced_player = AdvancedMediaPlayer()
  
    def play(self, filename):
        if filename.endswith(".vlc"):
            self.advanced_player.play_vlc(filename)
        elif filename.endswith(".mp4"):
            self.advanced_player.play_mp4(filename)
        else:
            print(f"Invalid media format for MediaAdapter: {filename}")

# Enhanced Client that uses the adapter
class MultimediaPlayer(MediaPlayer):
    def __init__(self):
        self.audio_player = AudioPlayer()
        self.media_adapter = MediaAdapter()
  
    def play(self, filename):
        # For mp3 files, use the native audio player
        if filename.endswith(".mp3"):
            self.audio_player.play(filename)
        # For vlc and mp4 files, use the adapter
        elif filename.endswith(".vlc") or filename.endswith(".mp4"):
            self.media_adapter.play(filename)
        else:
            print(f"Unsupported media format: {filename}")
```

Let's test our implementation:

```python
# Client code
player = MultimediaPlayer()

print("Playing various media files:")
player.play("sample.mp3")
player.play("movie.mp4")
player.play("video.vlc")
player.play("document.pdf")  # Unsupported format
```

This would produce output like:

```
Playing various media files:
Playing MP3 file: sample.mp3
Playing MP4 file: movie.mp4
Playing VLC file: video.vlc
Unsupported media format: document.pdf
```

## Understanding the Implementation

Let's analyze the key components of our implementation:

1. **Target (MediaPlayer)**: Defines the interface that clients expect to work with—in this case, a simple `play()` method.
2. **Adaptee (AdvancedMediaPlayer)**: Represents the incompatible interface we want to adapt. It provides specialized methods for different formats (`play_vlc()` and `play_mp4()`).
3. **Adapter (MediaAdapter)**: Implements the Target interface and translates calls to the Target's `play()` method into appropriate calls to the Adaptee's specialized methods.
4. **Client (MultimediaPlayer)**: Works with objects through the Target interface, using the Adapter when needed to handle incompatible formats.

This structure allows the system to support new media formats without modifying the client code. When a new format needs to be supported, we can extend the Adapter or create a new one.

## Two Variants of the Adapter Pattern

The Adapter pattern has two main variants: **Class Adapter** and **Object Adapter**. The implementation above is an Object Adapter, which uses composition. Let's explore both variants:

### Object Adapter (using composition)

This is the more common approach in Python, where the adapter holds a reference to the adaptee:

```python
# Object Adapter
class MediaAdapter(MediaPlayer):
    def __init__(self):
        self.advanced_player = AdvancedMediaPlayer()
  
    def play(self, filename):
        if filename.endswith(".vlc"):
            self.advanced_player.play_vlc(filename)
        elif filename.endswith(".mp4"):
            self.advanced_player.play_mp4(filename)
        else:
            print(f"Invalid media format for MediaAdapter: {filename}")
```

### Class Adapter (using multiple inheritance)

Python's support for multiple inheritance allows us to implement the Class Adapter variant, where the adapter inherits from both the target and adaptee:

```python
# Class Adapter using multiple inheritance
class MediaAdapter(MediaPlayer, AdvancedMediaPlayer):
    def play(self, filename):
        if filename.endswith(".vlc"):
            self.play_vlc(filename)
        elif filename.endswith(".mp4"):
            self.play_mp4(filename)
        else:
            print(f"Invalid media format for MediaAdapter: {filename}")
```

Each approach has its advantages:

- **Object Adapter**:

  - More flexible as it can adapt multiple adaptees
  - Follows composition over inheritance principle
  - Works even when the adaptee is a final class that can't be subclassed
- **Class Adapter**:

  - Can override behavior in both the target and adaptee
  - No need to reimplement the adaptee's methods
  - More direct access to the adaptee's protected members

In Python, the Object Adapter is generally preferred as it aligns better with composition over inheritance principles.

## Practical Example: Database Connection Adapter

Let's explore a more practical example—a system that needs to work with different database libraries:

```python
from abc import ABC, abstractmethod

# Target Interface
class DatabaseInterface(ABC):
    @abstractmethod
    def connect(self, connection_string):
        pass
  
    @abstractmethod
    def execute_query(self, query, parameters=None):
        pass
  
    @abstractmethod
    def close(self):
        pass

# Client code that uses the Target interface
class DataAnalyzer:
    def __init__(self, database):
        self.database = database
  
    def analyze_data(self, query, parameters=None):
        self.database.connect("connection_string")
        try:
            results = self.database.execute_query(query, parameters)
            return self._process_results(results)
        finally:
            self.database.close()
  
    def _process_results(self, results):
        # Process the data...
        return f"Processed {len(results)} records"

# Adaptee 1: A third-party MySQL library
class MySQLClient:
    def __init__(self):
        self.connection = None
  
    def create_connection(self, host, user, password, database):
        print(f"MySQL: Connecting to {host}/{database} as {user}")
        self.connection = f"MySQL connection to {database}"
        return True
  
    def run_query(self, sql, params=None):
        if not self.connection:
            raise Exception("Not connected to database")
      
        param_str = str(params) if params else "None"
        print(f"MySQL: Executing: {sql} with params {param_str}")
        # In a real implementation, this would return actual results
        return [{"id": 1, "name": "Sample Data"}]
  
    def disconnect(self):
        if self.connection:
            print("MySQL: Disconnecting")
            self.connection = None

# Adaptee 2: A third-party PostgreSQL library
class PostgreSQLDriver:
    def __init__(self):
        self.conn = None
  
    def open(self, connection_url):
        print(f"PostgreSQL: Opening connection to {connection_url}")
        self.conn = f"PostgreSQL connection to {connection_url}"
  
    def execute(self, query_string, vars_tuple=None):
        if not self.conn:
            raise Exception("Connection not opened")
      
        vars_str = str(vars_tuple) if vars_tuple else "None"
        print(f"PostgreSQL: Executing: {query_string} with vars {vars_str}")
        # In a real implementation, this would return actual results
        return [{"id": 2, "name": "Sample Postgres Data"}]
  
    def close_connection(self):
        if self.conn:
            print("PostgreSQL: Closing connection")
            self.conn = None

# Adapter for MySQL
class MySQLAdapter(DatabaseInterface):
    def __init__(self):
        self.mysql_client = MySQLClient()
  
    def connect(self, connection_string):
        # Parse the connection string into the format MySQL expects
        # This is simplified; real code would parse the string properly
        parts = connection_string.split(";")
        host = parts[0].split("=")[1]
        user = parts[1].split("=")[1]
        password = parts[2].split("=")[1]
        database = parts[3].split("=")[1]
      
        return self.mysql_client.create_connection(host, user, password, database)
  
    def execute_query(self, query, parameters=None):
        return self.mysql_client.run_query(query, parameters)
  
    def close(self):
        self.mysql_client.disconnect()

# Adapter for PostgreSQL
class PostgreSQLAdapter(DatabaseInterface):
    def __init__(self):
        self.pg_driver = PostgreSQLDriver()
  
    def connect(self, connection_string):
        # Convert the standard connection string to PostgreSQL format
        # In a real implementation, this would be more sophisticated
        pg_url = connection_string.replace(";", " ").replace("=", "=")
        self.pg_driver.open(pg_url)
  
    def execute_query(self, query, parameters=None):
        # Convert parameters dict to tuple if necessary
        if parameters and isinstance(parameters, dict):
            param_tuple = tuple(parameters.values())
        else:
            param_tuple = parameters
          
        return self.pg_driver.execute(query, param_tuple)
  
    def close(self):
        self.pg_driver.close_connection()
```

Now let's use our database adapters:

```python
# Test the adapters
connection_string = "host=localhost;user=admin;password=secret;database=test_db"

# Use MySQL
print("=== Using MySQL ===")
mysql_db = MySQLAdapter()
analyzer = DataAnalyzer(mysql_db)
result = analyzer.analyze_data("SELECT * FROM users WHERE active = ?", [True])
print(result)

print("\n=== Using PostgreSQL ===")
postgres_db = PostgreSQLAdapter()
analyzer = DataAnalyzer(postgres_db)
result = analyzer.analyze_data("SELECT * FROM users WHERE active = $1", [True])
print(result)
```

This example demonstrates how the Adapter pattern can be used to make different database libraries work with the same client code, despite their different interfaces.

## Using the Adapter Pattern with Existing Libraries

In real-world Python applications, you'll often need to adapt existing libraries to work with your code. Let's see an example of adapting two different image processing libraries:

```python
from abc import ABC, abstractmethod
from typing import Tuple, List

# Target Interface
class ImageProcessor(ABC):
    @abstractmethod
    def load_image(self, path: str):
        pass
  
    @abstractmethod
    def resize(self, width: int, height: int):
        pass
  
    @abstractmethod
    def apply_filter(self, filter_name: str):
        pass
  
    @abstractmethod
    def save(self, path: str):
        pass

# Client that uses the Target interface
class ImageBatchProcessor:
    def __init__(self, processor: ImageProcessor):
        self.processor = processor
  
    def process_images(self, input_folder: str, output_folder: str, 
                       size: Tuple[int, int], filters: List[str]):
        import os
      
        # Get all image files in the input folder
        image_files = [f for f in os.listdir(input_folder) 
                      if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
      
        for image_file in image_files:
            input_path = os.path.join(input_folder, image_file)
            output_path = os.path.join(output_folder, image_file)
          
            # Process each image
            self.processor.load_image(input_path)
            self.processor.resize(size[0], size[1])
          
            for filter_name in filters:
                self.processor.apply_filter(filter_name)
          
            self.processor.save(output_path)
          
        return f"Processed {len(image_files)} images"

# Adaptee 1: PIL (Pillow) library
# In a real implementation, this would import the actual PIL library
class PILLibrary:
    def __init__(self):
        self.image = None
      
    def open(self, filepath):
        print(f"PIL: Opening image {filepath}")
        self.image = f"PIL Image object for {filepath}"
      
    def resize_image(self, size):
        if not self.image:
            raise Exception("No image loaded")
        print(f"PIL: Resizing to {size}")
      
    def filter(self, filter_type):
        if not self.image:
            raise Exception("No image loaded")
        print(f"PIL: Applying filter {filter_type}")
      
    def save_image(self, output_path):
        if not self.image:
            raise Exception("No image loaded")
        print(f"PIL: Saving to {output_path}")

# Adaptee 2: OpenCV library
# In a real implementation, this would import the actual OpenCV library
class OpenCVLibrary:
    def __init__(self):
        self.img = None
      
    def imread(self, filename):
        print(f"OpenCV: Reading image {filename}")
        self.img = f"OpenCV Image matrix for {filename}"
        return self.img
      
    def resize(self, img, dsize):
        print(f"OpenCV: Resizing to {dsize}")
        return f"Resized {img}"
      
    def apply_filter(self, img, filter_code, params=None):
        filter_str = {1: "BLUR", 2: "SHARPEN", 3: "EDGE_DETECTION"}.get(filter_code, "UNKNOWN")
        print(f"OpenCV: Applying filter {filter_str} with params {params}")
        return f"Filtered {img}"
      
    def imwrite(self, filename, img):
        print(f"OpenCV: Writing image to {filename}")
        return True

# Adapter for PIL
class PILAdapter(ImageProcessor):
    def __init__(self):
        self.pil = PILLibrary()
        self.filter_map = {
            "blur": "BLUR",
            "sharpen": "SHARPEN",
            "edge_detect": "EDGE_ENHANCE"
        }
  
    def load_image(self, path: str):
        self.pil.open(path)
  
    def resize(self, width: int, height: int):
        self.pil.resize_image((width, height))
  
    def apply_filter(self, filter_name: str):
        pil_filter = self.filter_map.get(filter_name.lower(), "NORMAL")
        self.pil.filter(pil_filter)
  
    def save(self, path: str):
        self.pil.save_image(path)

# Adapter for OpenCV
class OpenCVAdapter(ImageProcessor):
    def __init__(self):
        self.cv = OpenCVLibrary()
        self.current_img = None
        self.filter_map = {
            "blur": 1,
            "sharpen": 2,
            "edge_detect": 3
        }
  
    def load_image(self, path: str):
        self.current_img = self.cv.imread(path)
  
    def resize(self, width: int, height: int):
        if self.current_img:
            self.current_img = self.cv.resize(self.current_img, (width, height))
  
    def apply_filter(self, filter_name: str):
        if self.current_img:
            filter_code = self.filter_map.get(filter_name.lower(), 0)
            self.current_img = self.cv.apply_filter(self.current_img, filter_code)
  
    def save(self, path: str):
        if self.current_img:
            self.cv.imwrite(path, self.current_img)
```

Let's use these adapters:

```python
# Test the image processing adapters
input_dir = "./input_images"
output_dir = "./output_images"
target_size = (800, 600)
filters_to_apply = ["blur", "sharpen"]

print("=== Using PIL ===")
pil_processor = PILAdapter()
batch_processor = ImageBatchProcessor(pil_processor)
result = batch_processor.process_images(input_dir, output_dir, target_size, filters_to_apply)
print(result)

print("\n=== Using OpenCV ===")
opencv_processor = OpenCVAdapter()
batch_processor = ImageBatchProcessor(opencv_processor)
result = batch_processor.process_images(input_dir, output_dir, target_size, filters_to_apply)
print(result)
```

This example shows how we can use the Adapter pattern to make different image processing libraries (PIL and OpenCV) work with the same client code, despite their different interfaces.

## Two-Way Adapters

Sometimes, we need to adapt interfaces in both directions. A two-way adapter allows objects of both classes to work together:

```python
from abc import ABC, abstractmethod

# First interface
class Rectangle(ABC):
    @abstractmethod
    def get_width(self):
        pass
  
    @abstractmethod
    def get_height(self):
        pass
  
    @abstractmethod
    def set_width(self, width):
        pass
  
    @abstractmethod
    def set_height(self, height):
        pass

# Second interface
class LegacyRectangle:
    def __init__(self):
        self.x1 = 0
        self.y1 = 0
        self.x2 = 0
        self.y2 = 0
  
    def set_points(self, x1, y1, x2, y2):
        self.x1 = x1
        self.y1 = y1
        self.x2 = x2
        self.y2 = y2
  
    def get_points(self):
        return (self.x1, self.y1, self.x2, self.y2)

# Two-way adapter
class RectangleAdapter(Rectangle, LegacyRectangle):
    def __init__(self):
        LegacyRectangle.__init__(self)
  
    # Rectangle interface methods
    def get_width(self):
        return abs(self.x2 - self.x1)
  
    def get_height(self):
        return abs(self.y2 - self.y1)
  
    def set_width(self, width):
        self.x2 = self.x1 + width
  
    def set_height(self, height):
        self.y2 = self.y1 + height
  
    # Additional methods to ensure consistency
    def set_points(self, x1, y1, x2, y2):
        super().set_points(x1, y1, x2, y2)
  
    def get_points(self):
        return super().get_points()
```

With a two-way adapter, we can use the adapted object with both the new and legacy systems.

## Adapter vs. Similar Patterns

Let's clarify how the Adapter pattern differs from similar patterns:

### Adapter vs. Bridge

Both patterns involve creating an abstraction to hide details, but:

- The **Adapter** pattern makes incompatible interfaces work together
- The **Bridge** pattern separates an abstraction from its implementation so they can vary independently

### Adapter vs. Decorator

Both patterns use composition and implement the same interface as the object they wrap, but:

- The **Adapter** pattern changes the interface of an existing object
- The **Decorator** pattern adds responsibilities to an object without changing its interface

### Adapter vs. Proxy

Both patterns wrap another object, but:

- The **Adapter** pattern provides a different interface for the wrapped object
- The **Proxy** pattern provides the same interface but controls access to the wrapped object

### Adapter vs. Facade

Both patterns involve simplifying interactions with existing code, but:

- The **Adapter** pattern makes incompatible interfaces compatible
- The **Facade** pattern simplifies a complex subsystem by providing a unified, higher-level interface

## Implementing Adapters Using Python's Dynamic Features

Python's dynamic nature allows for more flexible adapter implementations than statically typed languages. Let's explore some Python-specific adapter techniques:

### Duck Typing Adapters

Since Python uses duck typing, we can sometimes create adapters without formal interface definitions:

```python
class DuckTypingAdapter:
    def __init__(self, adaptee):
        self.adaptee = adaptee
  
    def __getattr__(self, name):
        # For any method that isn't explicitly defined, try to adapt
        # This is a simplified example; real code would have proper mapping
        attr = getattr(self.adaptee, self._convert_name(name))
        if callable(attr):
            # If it's a method, return a wrapper function
            def wrapper(*args, **kwargs):
                # Convert arguments if needed
                result = attr(*args, **kwargs)
                # Convert result if needed
                return result
            return wrapper
        # If it's an attribute, return it directly
        return attr
  
    def _convert_name(self, name):
        # Convert method names from target interface to adaptee interface
        # This is a simplistic example; real code would have a proper mapping
        name_map = {
            "connect": "create_connection",
            "execute_query": "run_query",
            "close": "disconnect",
            # Add more mappings as needed
        }
        return name_map.get(name, name)
```

This approach is flexible but should be used carefully as it can make code harder to understand and debug.

### Function Adapters

For simple cases, we can use function adapters that convert one function signature to another:

```python
def adapt_function(func, converter):
    """
    Create an adapter for a function that converts between interfaces.
  
    Args:
        func: The function to adapt
        converter: A function that converts arguments from target to adaptee
  
    Returns:
        An adapted function
    """
    def adapted_function(*args, **kwargs):
        # Convert arguments using the converter
        converted_args, converted_kwargs = converter(*args, **kwargs)
        # Call the original function with converted arguments
        result = func(*converted_args, **converted_kwargs)
        return result
  
    return adapted_function

# Example usage
def legacy_calculate(x, y, operation):
    if operation == "add":
        return x + y
    elif operation == "subtract":
        return x - y
    # ...

# Converter function
def modern_to_legacy_converter(a, b, operation_name):
    # Map modern operation names to legacy ones
    op_map = {"addition": "add", "subtraction": "subtract"}
    legacy_operation = op_map.get(operation_name, operation_name)
    return (a, b, legacy_operation), {}

# Create adapted function
modern_calculate = adapt_function(legacy_calculate, modern_to_legacy_converter)

# Use the adapted function
result = modern_calculate(5, 3, "addition")
print(f"Result: {result}")  # Output: Result: 8
```

This approach is useful for adapting individual functions rather than entire classes.

### Property Adapters

We can use Python properties to adapt attribute access:

```python
class PropertyAdapter:
    def __init__(self, adaptee):
        self._adaptee = adaptee
  
    @property
    def name(self):
        # Adapt property access
        return self._adaptee.getName()
  
    @name.setter
    def name(self, value):
        # Adapt property setting
        self._adaptee.setName(value)
  
    @property
    def address(self):
        # More complex adaptation
        street = self._adaptee.getStreet()
        city = self._adaptee.getCity()
        return f"{street}, {city}"
  
    @address.setter
    def address(self, value):
        # Parse combined address into components
        street, city = value.split(", ")
        self._adaptee.setStreet(street)
        self._adaptee.setCity(city)
```

This approach is useful when you need to adapt attribute access rather than method calls.

## Practical Example: Adapting Different Payment Gateways

Let's see a practical example of using the Adapter pattern to work with different payment gateways:

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Any, Optional

# Data class for payment information
@dataclass
class PaymentRequest:
    amount: float
    currency: str
    card_number: str
    card_expiry: str
    card_cvv: str
    description: str = ""

# Data class for payment response
@dataclass
class PaymentResponse:
    success: bool
    transaction_id: Optional[str] = None
    error_message: Optional[str] = None

# Target Interface
class PaymentGateway(ABC):
    @abstractmethod
    def process_payment(self, payment: PaymentRequest) -> PaymentResponse:
        pass
  
    @abstractmethod
    def verify_payment(self, transaction_id: str) -> bool:
        pass
  
    @abstractmethod
    def refund_payment(self, transaction_id: str, amount: Optional[float] = None) -> bool:
        pass

# Adaptee 1: Stripe-like API
class StripeAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        print(f"Initializing Stripe API with key: {api_key[:4]}...")
  
    def create_charge(self, amount_cents: int, currency: str, source: Dict[str, str], 
                      description: Optional[str] = None) -> Dict[str, Any]:
        print(f"Stripe: Creating charge for {amount_cents/100} {currency}")
        # In a real implementation, this would call the Stripe API
        return {
            "id": "ch_stripe123456",
            "object": "charge",
            "amount": amount_cents,
            "currency": currency,
            "status": "succeeded",
            "description": description
        }
  
    def get_charge(self, charge_id: str) -> Dict[str, Any]:
        print(f"Stripe: Getting charge {charge_id}")
        # In a real implementation, this would call the Stripe API
        return {
            "id": charge_id,
            "status": "succeeded"
        }
  
    def refund_charge(self, charge_id: str, amount_cents: Optional[int] = None) -> Dict[str, Any]:
        amount_str = f" for {amount_cents/100}" if amount_cents else " (full amount)"
        print(f"Stripe: Refunding charge {charge_id}{amount_str}")
        # In a real implementation, this would call the Stripe API
        return {
            "id": "re_stripe123456",
            "object": "refund",
            "charge": charge_id,
            "amount": amount_cents,
            "status": "succeeded"
        }

# Adaptee 2: PayPal-like API
class PayPalAPI:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        print(f"Initializing PayPal API with client ID: {client_id[:4]}...")
  
    def create_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        amount = payment_data.get("amount", {})
        print(f"PayPal: Creating payment for {amount.get('total')} {amount.get('currency')}")
        # In a real implementation, this would call the PayPal API
        return {
            "id": "PAY-paypal123456",
            "state": "approved",
            "transactions": [
                {
                    "amount": amount
                }
            ]
        }
  
    def get_payment_details(self, payment_id: str) -> Dict[str, Any]:
        print(f"PayPal: Getting payment details for {payment_id}")
        # In a real implementation, this would call the PayPal API
        return {
            "id": payment_id,
            "state": "approved"
        }
  
    def refund_transaction(self, transaction_id: str, refund_data: Dict[str, Any]) -> Dict[str, Any]:
        amount = refund_data.get("amount", {})
        amount_str = f"{amount.get('total')} {amount.get('currency')}" if amount else "full amount"
        print(f"PayPal: Refunding transaction {transaction_id} for {amount_str}")
        # In a real implementation, this would call the PayPal API
        return {
            "id": "REFUND-paypal123456",
            "state": "completed"
        }

# Adapter for Stripe
class StripeAdapter(PaymentGateway):
    def __init__(self, api_key: str):
        self.stripe = StripeAPI(api_key)
  
    def process_payment(self, payment: PaymentRequest) -> PaymentResponse:
        try:
            # Convert PaymentRequest to Stripe format
            amount_cents = int(payment.amount * 100)  # Stripe uses cents
            source = {
                "number": payment.card_number,
                "exp_month": payment.card_expiry.split("/")[0],
                "exp_year": payment.card_expiry.split("/")[1],
                "cvc": payment.card_cvv
            }
        
            # Call Stripe API
            result = self.stripe.create_charge(
                amount_cents=amount_cents,
                currency=payment.currency,
                source=source,
                description=payment.description
            )
        
            # Convert Stripe response to PaymentResponse
            if result.get("status") == "succeeded":
                return PaymentResponse(success=True, transaction_id=result.get("id"))
            else:
                return PaymentResponse(
                    success=False,
                    error_message=f"Payment failed with status: {result.get('status')}"
                )
        except Exception as e:
            return PaymentResponse(success=False, error_message=str(e))
  
    def verify_payment(self, transaction_id: str) -> bool:
        try:
            result = self.stripe.get_charge(transaction_id)
            return result.get("status") == "succeeded"
        except Exception:
            return False
  

    def refund_payment(self, transaction_id: str, amount: Optional[float] = None) -> bool:
        try:
            # Convert amount to cents for Stripe if provided
            amount_cents = int(amount * 100) if amount is not None else None
            
            result = self.stripe.refund_charge(transaction_id, amount_cents)
            return result.get("status") == "succeeded"
        except Exception:
            return False

# Adapter for PayPal
class PayPalAdapter(PaymentGateway):
    def __init__(self, client_id: str, client_secret: str):
        self.paypal = PayPalAPI(client_id, client_secret)
    
    def process_payment(self, payment: PaymentRequest) -> PaymentResponse:
        try:
            # Convert PaymentRequest to PayPal format
            payment_data = {
                "intent": "sale",
                "payer": {
                    "payment_method": "credit_card",
                    "funding_instruments": [
                        {
                            "credit_card": {
                                "number": payment.card_number,
                                "expiry": payment.card_expiry,
                                "cvv2": payment.card_cvv
                            }
                        }
                    ]
                },
                "amount": {
                    "total": str(payment.amount),
                    "currency": payment.currency
                },
                "description": payment.description
            }
            
            # Call PayPal API
            result = self.paypal.create_payment(payment_data)
            
            # Convert PayPal response to PaymentResponse
            if result.get("state") == "approved":
                return PaymentResponse(success=True, transaction_id=result.get("id"))
            else:
                return PaymentResponse(
                    success=False,
                    error_message=f"Payment failed with state: {result.get('state')}"
                )
        except Exception as e:
            return PaymentResponse(success=False, error_message=str(e))
    
    def verify_payment(self, transaction_id: str) -> bool:
        try:
            result = self.paypal.get_payment_details(transaction_id)
            return result.get("state") == "approved"
        except Exception:
            return False
    
    def refund_payment(self, transaction_id: str, amount: Optional[float] = None) -> bool:
        try:
            # Prepare refund data for PayPal
            refund_data = {}
            if amount is not None:
                refund_data["amount"] = {
                    "total": str(amount),
                    "currency": "USD"  # In a real implementation, we would store the currency
                }
            
            result = self.paypal.refund_transaction(transaction_id, refund_data)
            return result.get("state") == "completed"
        except Exception:
            return False
```

Now let's test our payment gateway adapters:

```python
# Client code that uses the payment gateway
class PaymentProcessor:
    def __init__(self, payment_gateway: PaymentGateway):
        self.payment_gateway = payment_gateway
    
    def charge_customer(self, amount: float, currency: str, 
                        card_details: Dict[str, str], description: str) -> str:
        # Create a payment request
        request = PaymentRequest(
            amount=amount,
            currency=currency,
            card_number=card_details["number"],
            card_expiry=card_details["expiry"],
            card_cvv=card_details["cvv"],
            description=description
        )
        
        # Process the payment
        response = self.payment_gateway.process_payment(request)
        
        if response.success:
            print(f"Payment successful! Transaction ID: {response.transaction_id}")
            return response.transaction_id
        else:
            print(f"Payment failed: {response.error_message}")
            return ""
    
    def refund_transaction(self, transaction_id: str, amount: Optional[float] = None) -> bool:
        if self.payment_gateway.verify_payment(transaction_id):
            result = self.payment_gateway.refund_payment(transaction_id, amount)
            if result:
                print(f"Refund successful for transaction {transaction_id}")
            else:
                print(f"Refund failed for transaction {transaction_id}")
            return result
        else:
            print(f"Cannot refund: Transaction {transaction_id} is not valid")
            return False

# Test with Stripe
print("=== Testing with Stripe ===")
stripe_gateway = StripeAdapter(api_key="sk_test_123456789")
processor = PaymentProcessor(stripe_gateway)

card_details = {
    "number": "4242424242424242",
    "expiry": "12/25",
    "cvv": "123"
}

transaction_id = processor.charge_customer(
    amount=99.99, 
    currency="USD", 
    card_details=card_details,
    description="Test purchase with Stripe"
)

if transaction_id:
    processor.refund_transaction(transaction_id, 49.99)  # Partial refund
    processor.refund_transaction(transaction_id)  # Full refund (would fail in real life)

# Test with PayPal
print("\n=== Testing with PayPal ===")
paypal_gateway = PayPalAdapter(client_id="client_123456", client_secret="secret_123456")
processor = PaymentProcessor(paypal_gateway)

transaction_id = processor.charge_customer(
    amount=149.99, 
    currency="EUR", 
    card_details=card_details,
    description="Test purchase with PayPal"
)

if transaction_id:
    processor.refund_transaction(transaction_id)  # Full refund
```

This example demonstrates how the Adapter pattern allows a client (PaymentProcessor) to work with different payment gateways (Stripe and PayPal) through a unified interface, despite their significant differences in APIs.

## Object Adapters with Composition vs Inheritance

Let's examine a more detailed comparison of composition vs. inheritance approaches for implementing adapters:

### Adapter Using Composition

```python
from abc import ABC, abstractmethod

# Target interface
class Target(ABC):
    @abstractmethod
    def request(self):
        pass

# Adaptee (incompatible interface)
class Adaptee:
    def specific_request(self):
        return "Adaptee's specific request"

# Object Adapter using composition
class Adapter(Target):
    def __init__(self, adaptee):
        self.adaptee = adaptee
    
    def request(self):
        # Translate the Target interface into the Adaptee interface
        return f"Adapter: Translating Target request to -> {self.adaptee.specific_request()}"
```

### Adapter Using Inheritance (Class Adapter)

```python
# Class Adapter using inheritance
class ClassAdapter(Target, Adaptee):
    def request(self):
        # Call the method inherited from Adaptee
        return f"ClassAdapter: Translating Target request to -> {self.specific_request()}"
```

### When to Choose Each Approach

The composition approach is generally preferred in Python for several reasons:

1. **Flexibility**: You can adapt objects at runtime rather than at compile time
2. **Less coupling**: The Adapter doesn't inherit implementation details from the Adaptee
3. **Better encapsulation**: The Adaptee can be a private member of the Adapter
4. **Adaptee subclassing**: You can adapt subclasses of the Adaptee without additional code
5. **Multiple adaptees**: You can adapt multiple Adaptees in a single Adapter

The inheritance approach might be useful when:

1. **The Adaptee has protected methods**: You need direct access to protected methods
2. **Performance is critical**: You want to avoid the extra indirection of composition
3. **Simplicity matters**: For very simple cases, inheritance might be clearer

## Dynamic Adapter Selection

In some situations, you might need to select an appropriate adapter at runtime based on the input or context. Here's a pattern for dynamic adapter selection:

```python
class AdapterFactory:
    """Factory for creating appropriate adapters based on the input type."""
    
    _adapters = {}
    
    @classmethod
    def register_adapter(cls, adaptee_type, adapter_class):
        """Register an adapter class for a specific adaptee type."""
        cls._adapters[adaptee_type] = adapter_class
    
    @classmethod
    def create_adapter(cls, adaptee):
        """Create and return an appropriate adapter for the given adaptee."""
        adaptee_type = type(adaptee)
        
        # Find the most specific adapter for this adaptee type
        for registered_type, adapter_class in cls._adapters.items():
            if isinstance(adaptee, registered_type):
                return adapter_class(adaptee)
        
        # If no specific adapter is found, raise an error
        raise TypeError(f"No adapter registered for {adaptee_type.__name__}")

# Usage example:
# Register adapters
AdapterFactory.register_adapter(Adaptee, Adapter)
AdapterFactory.register_adapter(SomeOtherClass, SomeOtherAdapter)

# Create an adaptee
adaptee = Adaptee()

# Dynamically get an appropriate adapter
adapter = AdapterFactory.create_adapter(adaptee)
```

This approach allows for flexible adapter selection based on the type of object to be adapted, which is useful in systems where you might receive different types of objects that need adapting.

## Bidirectional Adapters

Sometimes, you need to convert between two interfaces in both directions. A bidirectional adapter allows for this two-way conversion:

```python
class BidirectionalAdapter:
    """An adapter that can convert between two interfaces in both directions."""
    
    def __init__(self, system_a, system_b):
        self.system_a = system_a
        self.system_b = system_b
    
    # System A -> System B adaptation
    def a_to_b_method1(self, *args, **kwargs):
        # Convert System A's method call to System B's format
        converted_args = self._convert_a_to_b_args(*args, **kwargs)
        return self.system_b.b_method1(*converted_args)
    
    def a_to_b_method2(self, *args, **kwargs):
        # Another conversion from A to B
        converted_args = self._convert_a_to_b_args2(*args, **kwargs)
        return self.system_b.b_method2(*converted_args)
    
    # System B -> System A adaptation
    def b_to_a_method1(self, *args, **kwargs):
        # Convert System B's method call to System A's format
        converted_args = self._convert_b_to_a_args(*args, **kwargs)
        return self.system_a.a_method1(*converted_args)
    
    def b_to_a_method2(self, *args, **kwargs):
        # Another conversion from B to A
        converted_args = self._convert_b_to_a_args2(*args, **kwargs)
        return self.system_a.a_method2(*converted_args)
    
    # Conversion helper methods
    def _convert_a_to_b_args(self, *args, **kwargs):
        # Implement conversion logic here
        return args
    
    def _convert_a_to_b_args2(self, *args, **kwargs):
        # Implement conversion logic here
        return args
    
    def _convert_b_to_a_args(self, *args, **kwargs):
        # Implement conversion logic here
        return args
    
    def _convert_b_to_a_args2(self, *args, **kwargs):
        # Implement conversion logic here
        return args
```

Bidirectional adapters are useful when two systems need to communicate in both directions, such as in integration layers between different software systems or APIs.

## Adapter with Caching

In some cases, adapting operations might be expensive. Adding caching to an adapter can improve performance:

```python
import functools

class CachingAdapter:
    """An adapter that caches results to improve performance."""
    
    def __init__(self, adaptee, cache_size=128):
        self.adaptee = adaptee
        self.cache_size = cache_size
    
    @functools.lru_cache(maxsize=128)
    def expensive_operation(self, param):
        """
        Adapt and cache an expensive operation.
        The lru_cache decorator caches the results based on the input parameters.
        """
        # Perform some expensive adaptation
        return self.adaptee.complex_calculation(param * 2, timeout=30)
    
    def clear_cache(self):
        """Clear the operation cache."""
        self.expensive_operation.cache_clear()
```

This approach is particularly useful when the adaptation process involves complex transformations, network calls, or database queries.

## Adapter for Asynchronous APIs

Modern Python often involves asynchronous code. Here's how to adapt between synchronous and asynchronous interfaces:

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Synchronous API (Adaptee)
class SyncAPI:
    def get_data(self, id):
        print(f"Synchronously getting data for ID: {id}")
        # Simulate some blocking I/O
        import time
        time.sleep(1)
        return {"id": id, "name": f"Item {id}", "value": id * 100}

# Asynchronous Target Interface
class AsyncAPIInterface:
    async def get_data_async(self, id):
        pass

# Adapter that makes a synchronous API usable asynchronously
class AsyncAdapter(AsyncAPIInterface):
    def __init__(self, sync_api):
        self.sync_api = sync_api
        self.executor = ThreadPoolExecutor(max_workers=10)
    
    async def get_data_async(self, id):
        # Execute the synchronous method in a thread pool
        # to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor,
            self.sync_api.get_data,
            id
        )
```

Usage of the asynchronous adapter:

```python
async def main():
    # Create the synchronous API
    sync_api = SyncAPI()
    
    # Create the adapter
    async_adapter = AsyncAdapter(sync_api)
    
    # Use the asynchronous interface
    print("Starting async calls...")
    
    # Run multiple calls concurrently
    tasks = [
        async_adapter.get_data_async(1),
        async_adapter.get_data_async(2),
        async_adapter.get_data_async(3)
    ]
    
    results = await asyncio.gather(*tasks)
    
    for result in results:
        print(f"Got result: {result}")

# Run the async main function
if __name__ == "__main__":
    asyncio.run(main())
```

This pattern is extremely useful in modern Python applications that mix synchronous libraries with asynchronous code.

## Real-World Example: Database Driver Adapter

In real-world applications, you might need to work with different database backends. Let's create adapters for different database drivers:

```python
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

# Target Interface
class DatabaseDriver(ABC):
    @abstractmethod
    def connect(self, connection_string: str) -> bool:
        pass
    
    @abstractmethod
    def execute_query(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    def execute_update(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> int:
        pass
    
    @abstractmethod
    def close(self) -> None:
        pass

# Adaptee 1: SQLite
class SQLiteLibrary:
    def __init__(self):
        self.connection = None
        self.cursor = None
    
    def sqlite_connect(self, database_path):
        print(f"SQLite: Connecting to {database_path}")
        # In a real implementation, this would use the sqlite3 module
        self.connection = f"SQLite connection to {database_path}"
        self.cursor = f"SQLite cursor for {database_path}"
        return True
    
    def sqlite_execute(self, sql, params=None):
        if not self.connection:
            raise Exception("Not connected to database")
        
        print(f"SQLite: Executing query: {sql}")
        if params:
            print(f"SQLite: With parameters: {params}")
        
        # In a real implementation, this would execute the query
        # For demonstration, return some mock data
        return [{"id": 1, "name": "SQLite Mock Data"}]
    
    def sqlite_commit(self):
        if not self.connection:
            raise Exception("Not connected to database")
        
        print("SQLite: Committing transaction")
        return True
    
    def sqlite_close(self):
        if self.connection:
            print("SQLite: Closing connection")
            self.connection = None
            self.cursor = None

# Adaptee 2: PostgreSQL
class PostgreSQLLibrary:
    def __init__(self):
        self.conn = None
    
    def pg_connect(self, host, port, database, user, password):
        print(f"PostgreSQL: Connecting to {database} at {host}:{port}")
        # In a real implementation, this would use psycopg2 or another PostgreSQL driver
        self.conn = f"PostgreSQL connection to {database}"
        return self.conn is not None
    
    def pg_execute_query(self, query_string, params_dict=None):
        if not self.conn:
            raise Exception("Not connected to database")
        
        print(f"PostgreSQL: Executing query: {query_string}")
        if params_dict:
            print(f"PostgreSQL: With parameters: {params_dict}")
        
        # In a real implementation, this would execute the query
        # For demonstration, return some mock data
        return [{"id": 2, "name": "PostgreSQL Mock Data"}]
    
    def pg_execute_update(self, query_string, params_dict=None):
        if not self.conn:
            raise Exception("Not connected to database")
        
        print(f"PostgreSQL: Executing update: {query_string}")
        if params_dict:
            print(f"PostgreSQL: With parameters: {params_dict}")
        
        # In a real implementation, this would execute the update
        # For demonstration, return a mock row count
        return 1
    
    def pg_disconnect(self):
        if self.conn:
            print("PostgreSQL: Disconnecting")
            self.conn = None

# SQLite Adapter
class SQLiteAdapter(DatabaseDriver):
    def __init__(self):
        self.sqlite = SQLiteLibrary()
    
    def connect(self, connection_string: str) -> bool:
        # Parse connection string to extract database path
        # This is simplified; real code would parse the string properly
        database_path = connection_string.split("=")[1] if "=" in connection_string else connection_string
        return self.sqlite.sqlite_connect(database_path)
    
    def execute_query(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        # Convert named parameters from :name to ?
        # This is simplified; real code would do proper parameter substitution
        adapted_query = query.replace(":", "")
        return self.sqlite.sqlite_execute(adapted_query, parameters)
    
    def execute_update(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> int:
        # Execute the update and commit
        self.sqlite.sqlite_execute(query, parameters)
        self.sqlite.sqlite_commit()
        return 1  # Simplified; would return actual row count
    
    def close(self) -> None:
        self.sqlite.sqlite_close()

# PostgreSQL Adapter
class PostgreSQLAdapter(DatabaseDriver):
    def __init__(self):
        self.pg = PostgreSQLLibrary()
    
    def connect(self, connection_string: str) -> bool:
        # Parse connection string
        # Format: "host=localhost;port=5432;database=mydb;user=postgres;password=secret"
        params = {}
        for part in connection_string.split(";"):
            if "=" in part:
                key, value = part.split("=", 1)
                params[key] = value
        
        return self.pg.pg_connect(
            host=params.get("host", "localhost"),
            port=params.get("port", 5432),
            database=params.get("database", ""),
            user=params.get("user", ""),
            password=params.get("password", "")
        )
    
    def execute_query(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        # PostgreSQL uses $1, $2, etc. for parameters, but our interface uses named parameters
        # This is simplified; real code would convert parameter formats
        return self.pg.pg_execute_query(query, parameters)
    
    def execute_update(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> int:
        return self.pg.pg_execute_update(query, parameters)
    
    def close(self) -> None:
        self.pg.pg_disconnect()
```

Now let's use our database adapters:

```python
# Database client that works with any database driver
class DatabaseClient:
    def __init__(self, driver: DatabaseDriver):
        self.driver = driver
    
    def connect(self, connection_string: str) -> bool:
        return self.driver.connect(connection_string)
    
    def get_user_by_id(self, user_id: int) -> Dict[str, Any]:
        results = self.driver.execute_query(
            "SELECT * FROM users WHERE id = :id",
            {"id": user_id}
        )
        return results[0] if results else {}
    
    def update_user_name(self, user_id: int, new_name: str) -> bool:
        rows_affected = self.driver.execute_update(
            "UPDATE users SET name = :name WHERE id = :id",
            {"id": user_id, "name": new_name}
        )
        return rows_affected > 0
    
    def close(self) -> None:
        self.driver.close()

# Test with SQLite
print("=== Using SQLite ===")
sqlite_driver = SQLiteAdapter()
db_client = DatabaseClient(sqlite_driver)

db_client.connect("database=users.db")
user = db_client.get_user_by_id(1)
print(f"User from SQLite: {user}")
db_client.update_user_name(1, "Updated Name")
db_client.close()

# Test with PostgreSQL
print("\n=== Using PostgreSQL ===")
pg_driver = PostgreSQLAdapter()
db_client = DatabaseClient(pg_driver)

db_client.connect("host=localhost;port=5432;database=users;user=postgres;password=secret")
user = db_client.get_user_by_id(2)
print(f"User from PostgreSQL: {user}")
db_client.update_user_name(2, "Another Name")
db_client.close()
```

This example demonstrates how the Adapter pattern allows a client to work with different database backends through a unified interface, making the client code independent of the specific database technology.

## When to Use the Adapter Pattern

The Adapter pattern is most useful when:

1. **You need to use an existing class, but its interface doesn't match what you need**
2. **You want to create a reusable class that cooperates with classes that don't necessarily have compatible interfaces**
3. **You need to use several existing subclasses but can't adapt their interface by subclassing each one**
4. **You're integrating with a third-party library or legacy code that you can't modify**
5. **You need to support multiple implementations or standards with the same interface**

## Best Practices for Implementing Adapters

When implementing the Adapter pattern, keep these best practices in mind:

1. **Keep adapters focused**: Each adapter should have a clear, specific purpose—adapting one interface to another.

2. **Minimize adaptation logic**: Adapters should do the minimum necessary to adapt interfaces, avoiding additional business logic.

3. **Document interface differences**: Clearly document how the adapter translates between interfaces, especially for complex adaptations.

4. **Consider error handling**: Decide how to handle errors that might occur in the adaptee and how to translate them to the target interface.

5. **Test thoroughly**: Test adapters with edge cases to ensure they correctly handle all possible inputs and outputs.

6. **Use composition over inheritance**: In most cases, prefer object adapters (composition) over class adapters (inheritance).

7. **Consider performance implications**: Be aware of any performance overhead introduced by the adaptation process.

8. **Maintain interface stability**: Once clients depend on your adapter, try to maintain its interface stability.

## Conclusion

The Adapter pattern is a practical and versatile solution for making incompatible interfaces work together. It follows the principle of "making things work" rather than forcing redesigns of existing code.

In Python, the pattern is particularly flexible due to the language's dynamic nature and support for both composition and multiple inheritance. The choice between different implementations (object adapter vs. class adapter, static vs. dynamic adapters) depends on the specific requirements and constraints of your application.

By understanding the Adapter pattern from first principles, you can:

1. Integrate incompatible systems without modifying their source code
2. Create reusable components that work with a variety of backends
3. Isolate interface differences in dedicated adapter classes
4. Support legacy code and third-party libraries seamlessly
5. Implement standards compliance without major refactoring

Whether you're building integration layers, supporting multiple APIs, or working with legacy systems, the Adapter pattern offers a clean, maintainable approach to solving interface incompatibility problems.

Remember that while adapters can solve immediate compatibility issues, they do add a layer of indirection and complexity. In some cases, a more comprehensive refactoring to eliminate the need for adapters might be a better long-term solution. As with all design patterns, use the Adapter pattern judiciously based on your specific context and requirements.