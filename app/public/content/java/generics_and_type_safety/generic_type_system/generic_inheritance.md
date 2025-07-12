# Generic Inheritance: Subtyping Rules and Generic Type Relationships

Let me explain generic inheritance by building from foundational principles to the complex subtyping rules that govern how generic types relate to each other in Java's type system.

## Foundation: What Generics Solve

Before diving into inheritance, let's establish why generics exist and how they work at the fundamental level.

```java
// Pre-generics era (Java 1.4 and earlier)
ArrayList list = new ArrayList();
list.add("Hello");
list.add(42);  // No compile-time error!
String str = (String) list.get(1);  // Runtime ClassCastException!

// With generics (Java 5+)
ArrayList<String> list = new ArrayList<String>();
list.add("Hello");
// list.add(42);  // Compile-time error - type safety!
String str = list.get(0);  // No casting needed
```

> **Core Principle** : Generics provide compile-time type safety by allowing you to specify what types a class, interface, or method can work with. They eliminate the need for casting and catch type errors at compile time rather than runtime.

## The Fundamental Challenge: Type Relationships

Here's where it gets interesting. Consider this seemingly logical assumption:

```java
// If String extends Object, shouldn't List<String> extend List<Object>?
String str = "Hello";
Object obj = str;  // This works - String IS-A Object

List<String> stringList = new ArrayList<String>();
// List<Object> objList = stringList;  // Compile error! Why?
```

This is the heart of generic inheritance complexity. Let's build understanding step by step.

## Invariance: The Default Rule

```java
public class InvarianceExample {
    public static void main(String[] args) {
        // Basic inheritance works
        String str = "Hello";
        Object obj = str;  // OK - String is a subtype of Object
      
        // But generic types are INVARIANT by default
        List<String> stringList = Arrays.asList("Hello", "World");
        // List<Object> objList = stringList;  // COMPILE ERROR!
      
        // Why? Consider what could happen:
        demonstrateWhyInvarianceMatters();
    }
  
    public static void demonstrateWhyInvarianceMatters() {
        // Imagine if this were allowed (it's not):
        List<String> stringList = new ArrayList<>();
        stringList.add("Hello");
      
        // If we could do this assignment:
        // List<Object> objList = stringList;  // Not allowed!
        // objList.add(42);  // Would add Integer to String list!
      
        // Then this would fail:
        // String str = stringList.get(1);  // ClassCastException!
      
        System.out.println("Invariance prevents type corruption");
    }
}
```

> **Invariance Rule** : `List<String>` is NOT a subtype of `List<Object>`, even though `String` is a subtype of `Object`. Generic types are invariant by default - they maintain exact type relationships.

## Variance Through Wildcards

Java provides wildcards to express variance when needed:

### Covariance with `? extends`

```java
public class CovarianceExample {
    public static void main(String[] args) {
        // Covariance: "I can read, but not write"
        List<String> stringList = Arrays.asList("Hello", "World");
        List<? extends Object> objList = stringList;  // OK!
      
        // Reading is safe
        Object obj = objList.get(0);  // OK - everything is at least Object
      
        // Writing is restricted
        // objList.add("New");     // COMPILE ERROR!
        // objList.add(new Object()); // COMPILE ERROR!
        // objList.add(null);      // Only null is allowed
      
        demonstrateCovariantMethods();
    }
  
    // Method that accepts any list of Objects or subtype
    public static void printAll(List<? extends Object> list) {
        for (Object item : list) {
            System.out.println(item);  // Safe - can read as Object
        }
        // list.add("Can't add!");  // Compile error
    }
  
    public static void demonstrateCovariantMethods() {
        List<String> strings = Arrays.asList("A", "B", "C");
        List<Integer> integers = Arrays.asList(1, 2, 3);
        List<Double> doubles = Arrays.asList(1.1, 2.2, 3.3);
      
        // All work with the same method!
        printAll(strings);   // OK
        printAll(integers);  // OK  
        printAll(doubles);   // OK
    }
}
```

### Contravariance with `? super`

```java
public class ContravarianceExample {
    public static void main(String[] args) {
        // Contravariance: "I can write, but reading is limited"
        List<Object> objList = new ArrayList<>();
        List<? super String> stringSuper = objList;  // OK!
      
        // Writing is safe
        stringSuper.add("Hello");    // OK - String is accepted
        stringSuper.add("World");    // OK
      
        // Reading is limited
        Object obj = stringSuper.get(0);  // Can only read as Object
        // String str = stringSuper.get(0);  // COMPILE ERROR!
      
        demonstrateContravariantMethods();
    }
  
    // Method that can add strings to any collection that accepts String or supertype
    public static void addStrings(List<? super String> list) {
        list.add("Hello");       // Safe - any supertype accepts String
        list.add("World");       // Safe
        // String s = list.get(0);  // Compile error - don't know exact type
    }
  
    public static void demonstrateContravariantMethods() {
        List<Object> objects = new ArrayList<>();
        List<CharSequence> charSeqs = new ArrayList<>();
        List<String> strings = new ArrayList<>();
      
        // All can accept strings
        addStrings(objects);   // OK - Object > String
        addStrings(charSeqs);  // OK - CharSequence > String  
        addStrings(strings);   // OK - String = String
      
        System.out.println("Objects: " + objects);
        System.out.println("CharSeqs: " + charSeqs);
        System.out.println("Strings: " + strings);
    }
}
```

## The PECS Principle

> **Producer Extends, Consumer Super (PECS)** : Use `? extends T` when you're reading (producing) from the structure, use `? super T` when you're writing (consuming) to the structure.

```java
public class PECSExample {
    // Producer - reading from source
    public static <T> void copy(
            List<? extends T> source,     // Producer: extends
            List<? super T> destination   // Consumer: super
    ) {
        for (T item : source) {           // Reading from source
            destination.add(item);        // Writing to destination
        }
    }
  
    public static void main(String[] args) {
        // Demonstrate PECS in action
        List<String> strings = Arrays.asList("A", "B", "C");
        List<Object> objects = new ArrayList<>();
      
        copy(strings, objects);  // String source, Object destination
        System.out.println(objects);  // [A, B, C]
      
        // More complex example
        List<Integer> integers = Arrays.asList(1, 2, 3);
        List<Number> numbers = new ArrayList<>();
      
        copy(integers, numbers);  // Integer source, Number destination
        System.out.println(numbers);  // [1, 2, 3]
    }
}
```

## Generic Class Inheritance

When you inherit from generic classes, different rules apply:

```java
// Base generic class
class Container<T> {
    private T item;
  
    public Container(T item) {
        this.item = item;
    }
  
    public T getItem() {
        return item;
    }
  
    public void setItem(T item) {
        this.item = item;
    }
}

// Inheritance scenarios
class StringContainer extends Container<String> {
    public StringContainer(String item) {
        super(item);
    }
  
    // Can add String-specific methods
    public int getLength() {
        return getItem().length();
    }
}

class GenericContainer<T> extends Container<T> {
    private T backup;
  
    public GenericContainer(T item) {
        super(item);
        this.backup = item;
    }
  
    public void restore() {
        setItem(backup);
    }
}

// Raw type inheritance (not recommended)
class RawContainer extends Container {  // Warning: raw type
    public RawContainer(Object item) {
        super(item);
    }
}

public class GenericInheritanceExample {
    public static void main(String[] args) {
        // Concrete type inheritance
        StringContainer strContainer = new StringContainer("Hello");
        Container<String> container = strContainer;  // OK - proper inheritance
      
        // Generic inheritance
        GenericContainer<Integer> intContainer = new GenericContainer<>(42);
        Container<Integer> baseContainer = intContainer;  // OK
      
        // Demonstrate inheritance relationships
        demonstrateInheritanceRules();
    }
  
    public static void demonstrateInheritanceRules() {
        StringContainer strContainer = new StringContainer("Test");
      
        // These work - proper inheritance
        Container<String> container = strContainer;
        Object obj = strContainer;
      
        // These DON'T work - no generic covariance
        // Container<Object> objContainer = strContainer;  // Error!
        // Container<CharSequence> charContainer = strContainer;  // Error!
      
        System.out.println("Inheritance follows class hierarchy, not generic parameters");
    }
}
```

## Type Erasure and Inheritance

Understanding type erasure is crucial for generic inheritance:

```java
public class TypeErasureInheritance {
  
    // At runtime, both become Container due to type erasure
    static class StringContainer extends Container<String> {
        public StringContainer(String item) { super(item); }
    }
  
    static class IntegerContainer extends Container<Integer> {
        public IntegerContainer(Integer item) { super(item); }
    }
  
    public static void main(String[] args) {
        StringContainer strContainer = new StringContainer("Hello");
        IntegerContainer intContainer = new IntegerContainer(42);
      
        // At runtime, both are just "Container"
        System.out.println("String container class: " + strContainer.getClass());
        System.out.println("Integer container class: " + intContainer.getClass());
      
        // Erasure affects reflection
        demonstrateErasureEffects(strContainer, intContainer);
    }
  
    public static void demonstrateErasureEffects(Container<?> c1, Container<?> c2) {
        // Generic information is lost at runtime
        Class<?> class1 = c1.getClass().getSuperclass();
        Class<?> class2 = c2.getClass().getSuperclass();
      
        System.out.println("Same erased superclass? " + (class1 == class2));  // true
      
        // But compile-time types were different!
        // This is why we can't have Container<String> and Container<Integer>
        // as overloaded method parameters
    }
}
```

## Advanced: Bounded Type Parameters

```java
// Multiple bounds
class NumberContainer<T extends Number & Comparable<T>> {
    private T value;
  
    public NumberContainer(T value) {
        this.value = value;
    }
  
    public T getValue() {
        return value;
    }
  
    // Can use Number methods
    public double getDoubleValue() {
        return value.doubleValue();
    }
  
    // Can use Comparable methods  
    public int compareTo(T other) {
        return value.compareTo(other);
    }
}

// Inheritance with bounds
class IntegerContainer extends NumberContainer<Integer> {
    public IntegerContainer(Integer value) {
        super(value);
    }
  
    // Additional Integer-specific functionality
    public String toBinaryString() {
        return Integer.toBinaryString(getValue());
    }
}

public class BoundedInheritanceExample {
    public static void main(String[] args) {
        IntegerContainer intContainer = new IntegerContainer(42);
        NumberContainer<Integer> numContainer = intContainer;  // OK
      
        // Can use all inherited capabilities
        System.out.println("Value: " + numContainer.getValue());
        System.out.println("Double: " + numContainer.getDoubleValue());
        System.out.println("Comparison: " + numContainer.compareTo(30));
      
        // Specific functionality
        System.out.println("Binary: " + intContainer.toBinaryString());
      
        demonstrateBoundedWildcards();
    }
  
    public static void demonstrateBoundedWildcards() {
        List<Integer> integers = Arrays.asList(1, 2, 3);
        List<Double> doubles = Arrays.asList(1.1, 2.2, 3.3);
      
        // Method accepting any Number list
        printNumbers(integers);  // OK
        printNumbers(doubles);   // OK
        // printNumbers(Arrays.asList("A", "B"));  // Compile error
    }
  
    public static void printNumbers(List<? extends Number> numbers) {
        for (Number num : numbers) {
            System.out.println("Number: " + num.doubleValue());
        }
    }
}
```

## Common Pitfalls and Solutions

```java
public class GenericInheritancePitfalls {
  
    // PITFALL 1: Assuming covariance
    public static void pitfall1() {
        List<String> strings = new ArrayList<>();
        // List<Object> objects = strings;  // ERROR!
      
        // SOLUTION: Use wildcards when you need variance
        List<? extends Object> objects = strings;  // OK
    }
  
    // PITFALL 2: Method overloading with generics
    public static void processContainer(Container<String> container) {
        System.out.println("String container");
    }
  
    // This won't work due to type erasure
    // public static void processContainer(Container<Integer> container) {
    //     System.out.println("Integer container");
    // }
  
    // SOLUTION: Use bounded wildcards or different method names
    public static void processStringContainer(Container<String> container) {
        System.out.println("String container");
    }
  
    public static void processIntegerContainer(Container<Integer> container) {
        System.out.println("Integer container");
    }
  
    // Or use bounded wildcards
    public static void processNumberContainer(Container<? extends Number> container) {
        System.out.println("Number container: " + container.getItem());
    }
  
    // PITFALL 3: Generic arrays
    public static void pitfall3() {
        // Generic arrays are problematic
        // Container<String>[] array = new Container<String>[10];  // ERROR!
      
        // SOLUTION: Use lists or raw types with casting
        @SuppressWarnings("unchecked")
        Container<String>[] array = new Container[10];  // OK but unsafe
      
        List<Container<String>> list = new ArrayList<>();  // Better solution
    }
  
    public static void main(String[] args) {
        pitfall1();
      
        Container<String> strContainer = new Container<>("Hello");
        Container<Integer> intContainer = new Container<>(42);
      
        processStringContainer(strContainer);
        processIntegerContainer(intContainer);
        processNumberContainer(intContainer);
      
        pitfall3();
    }
}
```

## Memory Layout and Inheritance

```
JVM Memory Layout with Generic Inheritance:

Heap Memory:
┌─────────────────────────────────────┐
│ StringContainer instance            │
│ ├─ Object header                    │
│ ├─ Reference to Container<String>   │
│ │  ├─ item: "Hello" (String)        │
│ │  └─ vtable pointer                │
│ └─ StringContainer-specific data    │
└─────────────────────────────────────┘

Method Area (Class Information):
┌─────────────────────────────────────┐
│ Container.class (erased)            │
│ ├─ Method: getItem()→Object         │
│ ├─ Method: setItem(Object)          │
│ └─ Generic signature metadata       │
├─────────────────────────────────────┤
│ StringContainer.class               │
│ ├─ Extends: Container               │
│ ├─ Method: getLength()→int          │
│ └─ Bridge methods for erasure       │
└─────────────────────────────────────┘
```

## Best Practices for Generic Inheritance

> **Design Principles for Generic Inheritance** :
>
> 1. **Favor composition over inheritance** when generics are involved
> 2. **Use bounded wildcards** to express variance requirements clearly
> 3. **Avoid raw types** - they break type safety and cause warnings
> 4. **Design for type safety** - consider what operations should be allowed
> 5. **Document variance decisions** - make covariance/contravariance explicit

```java
// Example of well-designed generic inheritance
public abstract class Repository<T, ID> {
    protected abstract T findById(ID id);
    protected abstract List<T> findAll();
    protected abstract void save(T entity);
    protected abstract void delete(T entity);
}

public class UserRepository extends Repository<User, Long> {
    @Override
    protected User findById(Long id) {
        // Implementation specific to User
        return new User(id, "User" + id);
    }
  
    @Override
    protected List<User> findAll() {
        // User-specific implementation
        return Arrays.asList(new User(1L, "Alice"), new User(2L, "Bob"));
    }
  
    @Override
    protected void save(User entity) {
        System.out.println("Saving user: " + entity);
    }
  
    @Override
    protected void delete(User entity) {
        System.out.println("Deleting user: " + entity);
    }
  
    // Additional User-specific methods
    public List<User> findByName(String name) {
        return findAll().stream()
                .filter(user -> user.getName().contains(name))
                .collect(Collectors.toList());
    }
}

// Supporting classes
class User {
    private Long id;
    private String name;
  
    public User(Long id, String name) {
        this.id = id;
        this.name = name;
    }
  
    public Long getId() { return id; }
    public String getName() { return name; }
  
    @Override
    public String toString() {
        return "User{id=" + id + ", name='" + name + "'}";
    }
}
```

Generic inheritance in Java requires understanding the interplay between type safety, variance, and the limitations imposed by type erasure. The key is to use wildcards appropriately to express the variance you need while maintaining compile-time type safety.
