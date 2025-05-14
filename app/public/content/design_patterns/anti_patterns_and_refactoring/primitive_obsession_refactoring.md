# Primitive Obsession: Understanding and Refactoring

I'll explain primitive obsession from first principles, breaking down what it is, why it happens, why it's problematic, and how to refactor it properly.

> Primitive obsession is one of the most common code smells in software development. It occurs when we use primitive data types to represent domain ideas.

## What Are Primitives?

Let's start with the absolute basics. Primitives are the simplest data types in programming languages:

* Numbers (integers, floats)
* Strings
* Booleans
* Arrays (in some languages)
* Null/undefined values

These are the building blocks provided by programming languages themselves, not complex objects or custom types you define.

## What Is Primitive Obsession?

Primitive obsession occurs when we use these simple data types to represent complex domain concepts that deserve their own abstractions.

> Primitive obsession is the use of primitive data types for domain modeling instead of creating purpose-built objects to represent domain concepts.

### Examples of Primitive Obsession

1. **Using strings for concepts that have their own rules** :

```javascript
   // Primitive obsession
   function isValidEmail(email) {
     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   }

   function sendEmail(email, message) {
     if (isValidEmail(email)) {
       // Send email logic
     }
   }
```

1. **Using numbers for money** :

```python
   # Primitive obsession
   item_price = 10.99
   quantity = 3
   discount = 2.50

   # Calculation with potential floating-point issues
   total = (item_price * quantity) - discount
```

1. **Using multiple primitive values to represent a concept** :

```java
   // Primitive obsession
   String streetAddress = "123 Main St";
   String city = "Springfield";
   String state = "IL";
   String zipCode = "62704";

   // Functions that need all parts of an address must take all parameters
   void shipPackage(String streetAddress, String city, String state, String zipCode) {
     // Shipping logic
   }
```

## Why Does Primitive Obsession Occur?

1. **Path of least resistance** : It's easier and faster initially to just use a string or number.
2. **Lack of domain understanding** : Sometimes we don't yet realize that a concept deserves its own type.
3. **Performance concerns** : Misconception that custom types add too much overhead.
4. **Language limitations** : Some languages make it harder to create proper abstractions.

## Why Is Primitive Obsession Problematic?

### 1. Type Safety Issues

With primitives, any string can be passed where an email is expected, or any number where a monetary value is expected:

```java
// Nothing stops you from doing this:
sendEmail("not_an_email", "Hello"); 
applyDiscount(product, -50.0); // Negative discount?
```

### 2. Duplication of Validation Logic

The same validation code must be repeated everywhere the primitive is used:

```javascript
// In one place
if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  // Valid email
}

// In another place
if (email.includes('@') && email.includes('.')) {
  // Incomplete validation duplicated
}
```

### 3. Poor Domain Representation

The code doesn't clearly express what it's modeling:

```python
def process_order(items, user_id, shipping_address, billing_address, card_number, 
                 expiry_date, cvv, discount_code):
    # Many primitives grouped together without clear structure
    pass
```

### 4. Primitive Obsession Leads to Other Code Smells

1. **Long Parameter Lists** : Functions taking many primitive parameters
2. **Data Clumps** : Groups of primitives that always travel together
3. **Shotgun Surgery** : Changes to a concept require changes in many places

## Refactoring Primitive Obsession

Let's look at how to refactor primitive obsession using a step-by-step approach.

### Step 1: Identify Domain Concepts

Look for:

* Primitives that have validation rules
* Groups of primitives that appear together
* Primitives that have behavior associated with them

### Step 2: Create Value Objects

Value objects are immutable objects that represent concepts by their values, not their identity:

```javascript
// Refactoring email primitive to a value object
class Email {
  constructor(address) {
    if (!this.isValid(address)) {
      throw new Error('Invalid email address');
    }
    this._address = address;
  }
  
  isValid(address) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);
  }
  
  get address() {
    return this._address;
  }
  
  toString() {
    return this._address;
  }
}

// Usage
try {
  const email = new Email('user@example.com');
  sendEmail(email, "Hello"); // Type-safe
} catch (error) {
  console.error(error.message);
}
```

### Step 3: Replace Primitives with Value Objects

Let's refactor our money example:

```python
# Before: Primitive obsession
item_price = 10.99
quantity = 3
discount = 2.50
total = (item_price * quantity) - discount

# After: Using value objects
class Money:
    def __init__(self, amount, currency="USD"):
        self.amount = round(amount * 100) / 100  # Handle floating point properly
        self.currency = currency
      
    def __mul__(self, multiplier):
        return Money(self.amount * multiplier, self.currency)
      
    def __sub__(self, other):
        if self.currency != other.currency:
            raise ValueError("Cannot subtract different currencies")
        return Money(self.amount - other.amount, self.currency)
      
    def __str__(self):
        return f"{self.currency} {self.amount:.2f}"

# Usage with value objects
item_price = Money(10.99)
quantity = 3
discount = Money(2.50)
total = (item_price * quantity) - discount  # Same syntax, but type-safe
print(total)  # USD 30.47
```

### Step 4: Group Related Primitives into Objects

For our address example:

```java
// Before: Multiple primitives
String streetAddress = "123 Main St";
String city = "Springfield";
String state = "IL";
String zipCode = "62704";

// After: Address class
public class Address {
    private final String street;
    private final String city;
    private final String state;
    private final String zipCode;
  
    public Address(String street, String city, String state, String zipCode) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        validate();
    }
  
    private void validate() {
        // Validation logic for address
        if (zipCode == null || !zipCode.matches("\\d{5}(-\\d{4})?")) {
            throw new IllegalArgumentException("Invalid ZIP code");
        }
        // More validation...
    }
  
    public String getFormattedAddress() {
        return street + "\n" + city + ", " + state + " " + zipCode;
    }
  
    // Getters for properties
}

// Usage
Address shippingAddress = new Address("123 Main St", "Springfield", "IL", "62704");
shipPackage(shippingAddress); // Single parameter instead of four
```

## More Complex Examples

### Example 1: Date Ranges

```java
// Before: Primitive obsession
LocalDate startDate = LocalDate.of(2023, 1, 1);
LocalDate endDate = LocalDate.of(2023, 12, 31);

// Usage with primitive obsession
if (currentDate.isAfter(startDate) && currentDate.isBefore(endDate)) {
    // Date is in range
}

// After: DateRange value object
public class DateRange {
    private final LocalDate start;
    private final LocalDate end;
  
    public DateRange(LocalDate start, LocalDate end) {
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }
        this.start = start;
        this.end = end;
    }
  
    public boolean contains(LocalDate date) {
        return !date.isBefore(start) && !date.isAfter(end);
    }
  
    public boolean overlaps(DateRange other) {
        return !other.end.isBefore(this.start) && !other.start.isAfter(this.end);
    }
  
    public int lengthInDays() {
        return (int) ChronoUnit.DAYS.between(start, end) + 1;
    }
}

// Usage
DateRange yearRange = new DateRange(
    LocalDate.of(2023, 1, 1),
    LocalDate.of(2023, 12, 31)
);

if (yearRange.contains(currentDate)) {
    // Date is in range
}
```

### Example 2: Phone Numbers

```javascript
// Before: Primitive obsession
function formatPhoneNumber(phoneStr) {
  // Format logic for display
  return phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

// After: PhoneNumber class
class PhoneNumber {
  constructor(number) {
    // Strip non-digits
    this._digits = number.replace(/\D/g, '');
  
    if (!this.isValid()) {
      throw new Error('Invalid phone number');
    }
  }
  
  isValid() {
    return this._digits.length === 10;
  }
  
  get formatted() {
    return this._digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }
  
  get areaCode() {
    return this._digits.substring(0, 3);
  }
  
  get digits() {
    return this._digits;
  }
}

// Usage
const phone = new PhoneNumber('5551234567');
console.log(phone.formatted); // (555) 123-4567
console.log(phone.areaCode);  // 555
```

## Benefits of Refactoring Primitive Obsession

1. **Improved Type Safety** : The compiler/interpreter can help catch errors.
2. **Better Domain Modeling** : Code more clearly represents business concepts.
3. **Encapsulated Validation** : Validation logic lives with the data it validates.
4. **Reduced Duplication** : Common operations are defined once, in one place.
5. **Better API Design** : Parameters and return types communicate their purpose clearly.

## When to Refactor Primitive Obsession

You should consider refactoring when:

1. You have primitives with validation rules
2. You see the same group of primitives passed around together
3. You have primitives that represent domain concepts (Money, Email, PhoneNumber)
4. You're performing the same operations on primitives in multiple places

> Remember: Don't over-engineer. Not every string needs to be its own class. Use value objects for concepts that have validation rules or behavior.

## Practical Refactoring Strategy

1. Start small with the most problematic areas
2. Use test-driven development to ensure behavior doesn't change
3. Refactor one concept at a time
4. Update interfaces gradually rather than all at once

## Common Misconceptions About Refactoring Primitive Obsession

1. **"It adds unnecessary complexity"** : In fact, it reduces complexity by encapsulating behavior where it belongs.
2. **"It hurts performance"** : Modern JITs and VMs optimize well, and the gains in correctness usually outweigh minor performance impacts.
3. **"It's too much work"** : The work pays off in maintenance and code clarity.

## Conclusion

Primitive obsession is a subtle but pervasive code smell that leads to validation duplication, poor domain modeling, and type safety issues. By identifying domain concepts and creating value objects to represent them, you can make your code more expressive, safer, and easier to maintain.

Remember that the goal is not to eliminate all primitives, but to create proper abstractions for domain concepts that have their own rules and behavior.

Would you like me to elaborate on any part of primitive obsession, or would you like to see more examples of refactoring it in specific contexts?
