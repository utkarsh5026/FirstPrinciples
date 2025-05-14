# Feature Envy Detection in Software Design Pattern

Feature Envy is a code smell that reveals deeper problems in software design. I'll explain this concept from first principles, explore why it matters, and show you how to detect and fix it.

> "Good software design is not just about making code work; it's about making code that communicates its intent clearly and is resilient to change."

## The Foundation: Object-Oriented Design Principles

Let's start with the fundamental principles that help us understand Feature Envy.

### Encapsulation

Encapsulation is the bundling of data and the methods that operate on that data within a single unit (class). This principle suggests that:

1. Data should be hidden inside its class
2. Methods that manipulate that data should be contained within the same class
3. A class should expose only what's necessary through a well-defined interface

### Cohesion and Coupling

Two critical principles in software design are:

* **Cohesion** : How strongly related and focused the responsibilities of a single module are
* **Coupling** : The degree of interdependence between modules

High cohesion (where a class has a single, well-defined purpose) and loose coupling (where classes depend minimally on each other) are desirable traits in software design.

## What is Feature Envy?

Feature Envy occurs when a method in one class seems more interested in the data and functions of another class than its own. It's literally a method that "envies" the features of another class.

> "When a method accesses the data of another object more than its own data, it suggests that the method might belong in the other object."

### The Core Problem

Feature Envy violates key principles:

1. It breaks encapsulation by having methods in one class heavily manipulate data from another
2. It reduces cohesion since the class is handling responsibilities that conceptually belong elsewhere
3. It increases coupling as the envious class becomes more dependent on the other class's internal structure

## Identifying Feature Envy: The Warning Signs

### 1. Method Using More External Data Than Internal

A method that uses more attributes from another class than from its own is the clearest sign.

```java
// Example of Feature Envy
class Order {
    private List<OrderItem> items;
  
    public double calculateTotal() {
        double total = 0;
        for (OrderItem item : items) {
            // Accessing multiple features of OrderItem
            total += item.getPrice() * item.getQuantity() * 
                    (1 - item.getDiscount());
        }
        return total;
    }
}
```

In this example, the `calculateTotal` method is more interested in the properties of `OrderItem` than in `Order`'s own data.

### 2. Frequent Method Chaining

Another sign is excessive method chaining to access data:

```java
// Feature Envy through method chaining
customer.getAddress().getCountry().getPostalCode().startsWith("A");
```

### 3. Multiple Methods with the Same "Envy"

When several methods in a class all access the same external class's data:

```java
class ReportGenerator {
    public void generateSalesReport(Customer customer) {
        System.out.println("Customer: " + customer.getName());
        System.out.println("Contact: " + customer.getEmail());
        System.out.println("Status: " + customer.getStatus());
        // More customer data usage...
    }
  
    public void generateContactList(Customer customer) {
        System.out.println("Name: " + customer.getName());
        System.out.println("Phone: " + customer.getPhone());
        System.out.println("Email: " + customer.getEmail());
        // More customer data usage...
    }
}
```

Both methods are more focused on `Customer` data than on anything belonging to `ReportGenerator`.

## Quantifying Feature Envy

Tools can help detect Feature Envy by analyzing:

1. **Access Frequency** : How often a method accesses another class's members versus its own
2. **Access Dispersion** : Whether a method accesses many different external classes or just one
3. **Proportion of External vs. Internal Access** : The ratio of external to internal member accesses

### Sample Metric: Simple Access Count

```java
class Example {
    private int myData;
  
    public void suspiciousMethod(OtherClass other) {
        // One access to own data
        int x = this.myData;
      
        // Three accesses to OtherClass data
        int y = other.getA();
        int z = other.getB();
        other.setC(x + y + z);
      
        // Method has a 3:1 ratio of external:internal access
        // This suggests Feature Envy
    }
}
```

## Fixing Feature Envy

There are several strategies to address Feature Envy:

### 1. Move Method

The most common solution is to move the envious method to the class it's obsessed with.

```java
// Before: Feature Envy
class Order {
    private List<OrderItem> items;
  
    public double calculateTotal() {
        double total = 0;
        for (OrderItem item : items) {
            total += item.getPrice() * item.getQuantity() * 
                    (1 - item.getDiscount());
        }
        return total;
    }
}

// After: Fixed by creating a method in OrderItem
class OrderItem {
    private double price;
    private int quantity;
    private double discount;
  
    // Getters and setters...
  
    public double calculateItemTotal() {
        return price * quantity * (1 - discount);
    }
}

class Order {
    private List<OrderItem> items;
  
    public double calculateTotal() {
        double total = 0;
        for (OrderItem item : items) {
            total += item.calculateItemTotal();
        }
        return total;
    }
}
```

### 2. Extract Method

Sometimes you need to extract the envious part into a separate method and then move it.

```java
// Before
class A {
    public void methodWithEnvy(B b) {
        // Some code using A's data
      
        // Feature Envy part
        int x = b.getX();
        int y = b.getY();
        int result = x * y + b.getZ();
        b.process(result);
      
        // More code using A's data
    }
}

// After
class A {
    public void methodWithoutEnvy(B b) {
        // Some code using A's data
      
        b.processValues();
      
        // More code using A's data
    }
}

class B {
    private int x;
    private int y;
    private int z;
  
    // Getters and setters...
  
    public void processValues() {
        int result = x * y + z;
        this.process(result);
    }
}
```

### 3. Introduce Parameter Object

When you're accessing many attributes of a complex object, consider passing a more compact representation:

```java
// Before
class ReportGenerator {
    public String createUserSummary(User user) {
        return "User " + user.getName() + " (" + user.getAge() + ") " +
                "has address: " + user.getStreet() + ", " +
                user.getCity() + ", " + user.getCountry();
    }
}

// After
class User {
    // Original fields...
  
    public String getSummary() {
        return "User " + getName() + " (" + getAge() + ") " +
                "has address: " + getStreet() + ", " +
                getCity() + ", " + getCountry();
    }
}

class ReportGenerator {
    public String createUserSummary(User user) {
        return user.getSummary();
    }
}
```

## Real-World Example: A Shopping Cart Application

Let's look at a more extensive example in a shopping cart context:

```java
// Initial code with Feature Envy
class ShoppingCart {
    private List<Product> products;
  
    public double calculateTotalPrice() {
        double total = 0;
        for (Product product : products) {
            // Envying Product class data and logic
            double productPrice = product.getBasePrice();
          
            // Apply category-specific discounts
            if (product.getCategory().equals("Electronics")) {
                productPrice *= 0.95; // 5% off electronics
            } else if (product.getCategory().equals("Books")) {
                productPrice *= 0.90; // 10% off books
            }
          
            // Apply quantity discounts
            if (product.getQuantity() > 5) {
                productPrice *= 0.95; // Additional 5% off for bulk
            }
          
            total += productPrice * product.getQuantity();
        }
        return total;
    }
}
```

In this example, `calculateTotalPrice` is heavily dependent on `Product` data and contains logic that conceptually belongs to the `Product` class. Here's how we can fix it:

```java
// Refactored code without Feature Envy
class Product {
    private String name;
    private double basePrice;
    private String category;
    private int quantity;
  
    // Getters and setters...
  
    public double calculateDiscountedPrice() {
        double price = basePrice;
      
        // Apply category-specific discounts
        if (category.equals("Electronics")) {
            price *= 0.95; // 5% off electronics
        } else if (category.equals("Books")) {
            price *= 0.90; // 10% off books
        }
      
        // Apply quantity discounts
        if (quantity > 5) {
            price *= 0.95; // Additional 5% off for bulk
        }
      
        return price;
    }
  
    public double calculateTotalPrice() {
        return calculateDiscountedPrice() * quantity;
    }
}

class ShoppingCart {
    private List<Product> products;
  
    public double calculateTotalPrice() {
        double total = 0;
        for (Product product : products) {
            total += product.calculateTotalPrice();
        }
        return total;
    }
}
```

This refactoring moves the pricing logic to the `Product` class where it belongs, resulting in:

1. Higher cohesion in both classes
2. Reduced coupling between `ShoppingCart` and `Product`'s internal details
3. Clearer responsibilities for each class
4. More maintainable code that's easier to extend

## Automated Detection Tools

Several tools can help identify Feature Envy:

1. **SonarQube** : Reports Feature Envy as part of its code quality analysis
2. **JDeodorant** : A plugin for Eclipse that detects code smells including Feature Envy
3. **IntelliJ IDEA** : Has built-in inspections that can identify potential Feature Envy
4. **PMD** : Includes rules for detecting Feature Envy in Java code

## When Feature Envy Might Be Acceptable

There are situations where apparent Feature Envy might be justified:

1. **Adapter Pattern** : When a class is specifically designed to adapt one interface to another
2. **Strategy Pattern** : When implementing alternate algorithms that operate on the same data
3. **Performance Optimizations** : When moving methods would create performance problems
4. **External API Constraints** : When working with APIs that can't be modified

> "Rules in software design are guidelines, not commandments. Understanding when to break them is as important as knowing them in the first place."

## Practical Exercise: Detecting Feature Envy

Let's practice identifying Feature Envy with a simple exercise:

```java
class Customer {
    private String name;
    private String email;
    private Address address;
  
    // Getters and setters...
}

class Address {
    private String street;
    private String city;
    private String country;
    private String postalCode;
  
    // Getters and setters...
}

class CustomerValidator {
    public boolean isInternational(Customer customer) {
        // Is this method showing Feature Envy?
        return !customer.getAddress().getCountry().equals("USA");
    }
  
    public boolean hasValidPostalCode(Customer customer) {
        // Is this method showing Feature Envy?
        String postalCode = customer.getAddress().getPostalCode();
        return postalCode != null && postalCode.matches("[0-9]{5}");
    }
}
```

Let's analyze:

Both methods in `CustomerValidator` are primarily interested in `Address` data, accessed through `Customer`. This suggests Feature Envy. A better design would be:

```java
class Address {
    private String street;
    private String city;
    private String country;
    private String postalCode;
  
    // Getters and setters...
  
    public boolean isInternational() {
        return !country.equals("USA");
    }
  
    public boolean hasValidPostalCode() {
        return postalCode != null && postalCode.matches("[0-9]{5}");
    }
}

class CustomerValidator {
    public boolean isInternational(Customer customer) {
        return customer.getAddress().isInternational();
    }
  
    public boolean hasValidPostalCode(Customer customer) {
        return customer.getAddress().hasValidPostalCode();
    }
}
```

Or even better, if these validations are frequently used together:

```java
class Customer {
    private String name;
    private String email;
    private Address address;
  
    // Getters and setters...
  
    public boolean hasInternationalAddress() {
        return address.isInternational();
    }
  
    public boolean hasValidPostalCode() {
        return address.hasValidPostalCode();
    }
}

class CustomerValidator {
    public boolean isInternational(Customer customer) {
        return customer.hasInternationalAddress();
    }
  
    public boolean hasValidPostalCode(Customer customer) {
        return customer.hasValidPostalCode();
    }
}
```

## Conclusion

Feature Envy is a powerful concept in software design that helps us identify misplaced responsibilities in our code. By detecting and fixing Feature Envy, we create systems that are:

1. More maintainable and easier to understand
2. More aligned with object-oriented design principles
3. More resilient to change
4. More cohesive and less coupled

Remember that the goal of addressing Feature Envy isn't just to follow rules mechanically, but to create software that better expresses the underlying domain and is easier to change over time.

> "Feature Envy is a messenger - it tells us that our code wants to be structured differently. Learning to listen to that message is a key skill in software design."

As you continue to develop software, train yourself to spot the signs of Feature Envy and consider whether functionality might be better placed elsewhere in your system.
