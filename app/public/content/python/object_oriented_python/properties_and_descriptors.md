# Python Properties and Descriptors: A First Principles Exploration

Let's explore Python properties and descriptors from the ground up, building our understanding step by step with clear examples along the way.

## Part 1: The Problem Properties Solve

To understand properties, we must first understand the problem they solve. In object-oriented programming, we often want to:

1. Control access to an object's attributes
2. Validate data before storing it
3. Compute values on-the-fly instead of storing them
4. Maintain a clean, consistent interface even as implementation details change

Let's start with a simple class that doesn't use properties:

```python
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius
```

This works fine initially:

```python
temp = Temperature(25)
print(temp.celsius)  # 25
```

But what if we want to add Fahrenheit support? We could add a separate attribute:

```python
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius
        self.fahrenheit = celsius * 9/5 + 32
```

But now we have a problem: if we change one temperature, the other becomes inconsistent:

```python
temp = Temperature(25)
print(temp.celsius)     # 25
print(temp.fahrenheit)  # 77.0

# Now let's change celsius
temp.celsius = 30
print(temp.celsius)     # 30
print(temp.fahrenheit)  # Still 77.0! This is wrong!
```

This inconsistency is exactly what properties help us solve.

## Part 2: Getters and Setters - A First Approach

One approach is to use methods to get and set values:

```python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius  # Note the underscore - convention for "private"
  
    def get_celsius(self):
        return self._celsius
  
    def set_celsius(self, value):
        self._celsius = value
  
    def get_fahrenheit(self):
        return self._celsius * 9/5 + 32
  
    def set_fahrenheit(self, value):
        self._celsius = (value - 32) * 5/9
```

Now we can maintain consistency:

```python
temp = Temperature(25)
print(temp.get_celsius())     # 25
print(temp.get_fahrenheit())  # 77.0

temp.set_celsius(30)
print(temp.get_celsius())     # 30
print(temp.get_fahrenheit())  # 86.0 - Correctly updated!

temp.set_fahrenheit(68)
print(temp.get_celsius())     # 20.0 - Correctly updated!
print(temp.get_fahrenheit())  # 68.0
```

This works, but it's verbose and doesn't provide the clean attribute-like syntax Python programmers expect. This leads us to properties.

## Part 3: Properties - The Pythonic Solution

Properties give us the best of both worlds: the syntax of attributes with the control of methods.

### Basic Property Usage

```python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius
  
    @property
    def celsius(self):
        return self._celsius
  
    @celsius.setter
    def celsius(self, value):
        self._celsius = value
  
    @property
    def fahrenheit(self):
        return self._celsius * 9/5 + 32
  
    @fahrenheit.setter
    def fahrenheit(self, value):
        self._celsius = (value - 32) * 5/9
```

Now we can use a cleaner syntax:

```python
temp = Temperature(25)
print(temp.celsius)     # 25
print(temp.fahrenheit)  # 77.0

temp.celsius = 30
print(temp.celsius)     # 30
print(temp.fahrenheit)  # 86.0 - Correctly updated!

temp.fahrenheit = 68
print(temp.celsius)     # 20.0 - Correctly updated!
print(temp.fahrenheit)  # 68.0
```

The `@property` decorator transforms a method into a "getter" for a property. The `@name.setter` decorator creates a "setter" for that property. You can also add a `@name.deleter` to control what happens when the user does `del obj.name`.

### Under the Hood: The property() Function

The `@property` decorator is actually using a built-in function called `property()`. We could rewrite our class without decorators:

```python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius
  
    def get_celsius(self):
        return self._celsius
  
    def set_celsius(self, value):
        self._celsius = value
  
    def get_fahrenheit(self):
        return self._celsius * 9/5 + 32
  
    def set_fahrenheit(self, value):
        self._celsius = (value - 32) * 5/9
  
    # Create property objects
    celsius = property(get_celsius, set_celsius)
    fahrenheit = property(get_fahrenheit, set_fahrenheit)
```

This produces exactly the same behavior. The `property()` function takes four optional arguments:

1. fget: The getter method
2. fset: The setter method
3. fdel: The deleter method
4. doc: A docstring for the property

## Part 4: Property Use Cases

### 1. Data Validation

Properties allow us to validate data before setting it:

```python
class Person:
    def __init__(self, name, age):
        self._name = name
        self._age = age
  
    @property
    def name(self):
        return self._name
  
    @name.setter
    def name(self, value):
        if not isinstance(value, str):
            raise TypeError("Name must be a string")
        if len(value) < 2:
            raise ValueError("Name must be at least 2 characters long")
        self._name = value
  
    @property
    def age(self):
        return self._age
  
    @age.setter
    def age(self, value):
        if not isinstance(value, int):
            raise TypeError("Age must be an integer")
        if value < 0 or value > 150:
            raise ValueError("Age must be between 0 and 150")
        self._age = value
```

This ensures our data stays valid:

```python
person = Person("Alice", 30)

# These will raise errors:
# person.name = 123        # TypeError: Name must be a string
# person.name = "A"        # ValueError: Name must be at least 2 characters long
# person.age = "thirty"    # TypeError: Age must be an integer
# person.age = -5          # ValueError: Age must be between 0 and 150
```

### 2. Computed Properties

Properties can be computed on-the-fly:

```python
import datetime

class Employee:
    def __init__(self, first_name, last_name, birth_year, salary):
        self.first_name = first_name
        self.last_name = last_name
        self.birth_year = birth_year
        self.salary = salary
  
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
  
    @property
    def age(self):
        current_year = datetime.datetime.now().year
        return current_year - self.birth_year
  
    @property
    def monthly_salary(self):
        return self.salary / 12
```

These properties don't need separate storage; they're calculated when accessed:

```python
emp = Employee("John", "Doe", 1990, 60000)
print(emp.full_name)       # John Doe
print(emp.age)             # Current age based on birth year
print(emp.monthly_salary)  # 5000.0
```

### 3. Lazy Initialization

Properties can delay expensive computations until needed:

```python
class DataAnalyzer:
    def __init__(self, data_file):
        self.data_file = data_file
        self._data = None  # Not loaded yet
  
    @property
    def data(self):
        if self._data is None:
            print("Loading data from file...")
            # This could be an expensive operation
            with open(self.data_file, 'r') as f:
                self._data = [line.strip() for line in f]
        return self._data
```

Now the data is only loaded when needed:

```python
analyzer = DataAnalyzer("large_dataset.txt")
# At this point, no data has been loaded

# Only when we access the data property is the file read
print(len(analyzer.data))  # "Loading data from file..." is printed, then the length
print(len(analyzer.data))  # No loading message this time, as data is already cached
```

### 4. Read-Only Properties

Simply omit the setter to create read-only properties:

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius
  
    @property
    def radius(self):
        return self._radius
  
    @radius.setter
    def radius(self, value):
        if value <= 0:
            raise ValueError("Radius must be positive")
        self._radius = value
  
    @property
    def area(self):
        return 3.14159 * self._radius ** 2
  
    @property
    def circumference(self):
        return 2 * 3.14159 * self._radius
```

Here, `radius` can be changed, but `area` and `circumference` are read-only:

```python
circle = Circle(5)
print(circle.radius)        # 5
print(circle.area)          # 78.53975
print(circle.circumference) # 31.4159

circle.radius = 10          # This works
print(circle.area)          # 314.159 - Updated automatically

# circle.area = 100         # AttributeError: can't set attribute
```

## Part 5: Descriptors - Going Deeper

Properties are actually implemented using a more general mechanism called "descriptors." A descriptor is any object that implements at least one of these methods:

* `__get__(self, obj, type=None)`
* `__set__(self, obj, value)`
* `__delete__(self, obj)`

### Basic Descriptor Example

Let's implement a descriptor for a validated integer:

```python
class ValidatedInteger:
    def __init__(self, min_value=None, max_value=None):
        self.min_value = min_value
        self.max_value = max_value
        self.name = None  # Will be set when the descriptor is assigned to a class
  
    def __set_name__(self, owner, name):
        # This is called when the descriptor is assigned to a class attribute
        self.name = name
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self  # Access from the class, not an instance
        # Get the value from the instance's __dict__
        return obj.__dict__.get(self.name)
  
    def __set__(self, obj, value):
        if not isinstance(value, int):
            raise TypeError(f"{self.name} must be an integer")
      
        if self.min_value is not None and value < self.min_value:
            raise ValueError(f"{self.name} must be >= {self.min_value}")
      
        if self.max_value is not None and value > self.max_value:
            raise ValueError(f"{self.name} must be <= {self.max_value}")
      
        # Store the value in the instance's __dict__
        obj.__dict__[self.name] = value
```

Now we can use this descriptor in a class:

```python
class Person:
    age = ValidatedInteger(min_value=0, max_value=150)
  
    def __init__(self, name, age):
        self.name = name
        self.age = age  # This will use the descriptor's __set__ method
```

When we use the `Person` class:

```python
person = Person("Alice", 30)
print(person.age)  # 30

person.age = 40    # This works
# person.age = -5  # ValueError: age must be >= 0
# person.age = 200 # ValueError: age must be <= 150
# person.age = "30" # TypeError: age must be an integer
```

### How Descriptors Work

When you access an attribute on an object, Python follows this lookup sequence:

1. Check if there's a `__getattribute__` method and call it
2. Check for a data descriptor (one that implements `__get__` and `__set__`)
3. Check the instance's `__dict__`
4. Check the class's `__dict__` and any parent classes
5. Check for a non-data descriptor (one that implements only `__get__`)
6. Return the default value or raise `AttributeError`

When you assign to an attribute (`obj.attr = value`), Python:

1. Checks if there's a `__setattr__` method and calls it
2. Checks if there's a data descriptor with a `__set__` method and calls it
3. Sets the value in the instance's `__dict__`

### Real-World Descriptor Example: `property()`

The `property()` function actually creates a descriptor. We can implement a simplified version:

```python
class MyProperty:
    def __init__(self, fget=None, fset=None, fdel=None, doc=None):
        self.fget = fget
        self.fset = fset
        self.fdel = fdel
        self.__doc__ = doc
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        if self.fget is None:
            raise AttributeError("unreadable attribute")
        return self.fget(obj)
  
    def __set__(self, obj, value):
        if self.fset is None:
            raise AttributeError("can't set attribute")
        self.fset(obj, value)
  
    def __delete__(self, obj):
        if self.fdel is None:
            raise AttributeError("can't delete attribute")
        self.fdel(obj)
      
    def getter(self, fget):
        return type(self)(fget, self.fset, self.fdel, self.__doc__)
  
    def setter(self, fset):
        return type(self)(self.fget, fset, self.fdel, self.__doc__)
  
    def deleter(self, fdel):
        return type(self)(self.fget, self.fset, fdel, self.__doc__)
```

This works similarly to the built-in `property`:

```python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius
  
    @MyProperty
    def celsius(self):
        return self._celsius
  
    @celsius.setter
    def celsius(self, value):
        self._celsius = value
```

### Practical Descriptor Examples

#### Type Validation Descriptors

```python
class Typed:
    def __init__(self, name, expected_type):
        self.name = name
        self.expected_type = expected_type
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
  
    def __set__(self, obj, value):
        if not isinstance(value, self.expected_type):
            raise TypeError(f"Expected {self.expected_type}")
        obj.__dict__[self.name] = value

# Specialized descriptors
class Integer(Typed):
    def __init__(self, name):
        super().__init__(name, int)

class Float(Typed):
    def __init__(self, name):
        super().__init__(name, float)

class String(Typed):
    def __init__(self, name):
        super().__init__(name, str)
```

With a metaclass for automatic name assignment:

```python
class TypedMeta(type):
    def __new__(mcs, name, bases, namespace):
        # Set the name attribute for each descriptor
        for key, value in namespace.items():
            if isinstance(value, Typed):
                value.name = key
        return super().__new__(mcs, name, bases, namespace)

class MyModel(metaclass=TypedMeta):
    name = String()
    age = Integer()
    height = Float()
  
    def __init__(self, name, age, height):
        self.name = name
        self.age = age
        self.height = height
```

Now our model enforces types:

```python
person = MyModel("Alice", 30, 5.6)
# person.age = "thirty"  # TypeError: Expected <class 'int'>
```

#### Unit Conversion Descriptor

```python
class Distance:
    def __init__(self, default=0.0):
        self.default = default
        self.data = {}  # Store values for each instance
  
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return self.data.get(instance, self.default)
  
    def __set__(self, instance, value):
        self.data[instance] = value
  
    def meters(self, instance):
        return self.data.get(instance, self.default)
  
    def kilometers(self, instance):
        return self.data.get(instance, self.default) / 1000
  
    def miles(self, instance):
        return self.data.get(instance, self.default) * 0.000621371

class Journey:
    distance = Distance()
  
    def __init__(self, distance_meters):
        self.distance = distance_meters
  
    @property
    def distance_km(self):
        return self.distance.kilometers(self)
  
    @property
    def distance_miles(self):
        return self.distance.miles(self)
```

Using the distance descriptor:

```python
trip = Journey(5000)
print(trip.distance)       # 5000
print(trip.distance_km)    # 5.0
print(trip.distance_miles) # 3.10685
```

## Part 6: Advanced Property and Descriptor Features

### Property Inheritance

Properties are inherited like any other class attribute:

```python
class Base:
    @property
    def value(self):
        return 42

class Derived(Base):
    pass

d = Derived()
print(d.value)  # 42
```

You can override just the getter or just the setter in a subclass:

```python
class Base:
    @property
    def value(self):
        return self._value
  
    @value.setter
    def value(self, value):
        self._value = value

class Derived(Base):
    @Base.value.getter
    def value(self):
        return super().value * 2
```

### Property Factory Pattern

You can create a function that returns a property:

```python
def typed_property(name, expected_type):
    storage_name = '_' + name
  
    @property
    def prop(self):
        return getattr(self, storage_name)
  
    @prop.setter
    def prop(self, value):
        if not isinstance(value, expected_type):
            raise TypeError(f"{name} must be a {expected_type}")
        setattr(self, storage_name, value)
  
    return prop

class Person:
    name = typed_property('name', str)
    age = typed_property('age', int)
  
    def __init__(self, name, age):
        self.name = name
        self.age = age
```

### Caching Property Values with `functools.cached_property`

For Python 3.8+, there's a built-in decorator for caching property values:

```python
from functools import cached_property

class DataProcessor:
    def __init__(self, data):
        self.data = data
  
    @cached_property
    def processed_data(self):
        print("Processing data...")
        # Simulate expensive calculation
        result = [x * 2 for x in self.data]
        return result
```

Now the calculation happens only once:

```python
processor = DataProcessor([1, 2, 3, 4, 5])
print(processor.processed_data)  # "Processing data..." is printed, then [2, 4, 6, 8, 10]
print(processor.processed_data)  # Just [2, 4, 6, 8, 10], no processing message
```

### Descriptor Protocol Extensions

In Python 3.6+, descriptors gained the `__set_name__` method which is called when the descriptor is assigned to a class variable:

```python
class Field:
    def __init__(self):
        self.name = None
        self.internal_name = None
  
    def __set_name__(self, owner, name):
        self.name = name
        self.internal_name = '_' + name
  
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return getattr(instance, self.internal_name, None)
  
    def __set__(self, instance, value):
        setattr(instance, self.internal_name, value)

class Model:
    name = Field()
    age = Field()
  
    def __init__(self, name, age):
        self.name = name
        self.age = age
```

Now each `Field` automatically gets a unique storage name.

## Conclusion

Properties and descriptors are powerful tools in Python that allow you to:

1. Control access to attributes
2. Validate data
3. Compute values dynamically
4. Implement caching and lazy loading
5. Create reusable attribute behavior

Properties (`@property`) provide a simple interface for the common case of getters and setters, while descriptors offer more flexibility for creating sophisticated attribute behavior. Both mechanisms allow you to maintain a clean, Pythonic API while adding complex functionality behind the scenes.

By understanding properties and descriptors from first principles, you now have the knowledge to design more robust and maintainable Python classes.
