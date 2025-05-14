# The Strategy Pattern: A First Principles Approach

I'll explain the Strategy Pattern from first principles, starting with the fundamental concepts and building up to practical implementations with code examples.

> The Strategy Pattern is about making algorithms interchangeable within a context. It's like having different tools in your toolbox that all serve the same purpose but in different ways, and being able to pick the right one for the job at hand.

## 1. Understanding the Problem Space

Let's start with a simple question: What happens when you need different ways to accomplish the same task?

Imagine you're building a navigation app. Users want to get from point A to point B, but they might want to:

* Take the fastest route
* Take the route with the least traffic
* Take the most scenic route
* Take public transportation

Each of these represents a different **strategy** for solving the same problem: getting from point A to point B.

## 2. The Traditional Approach (and Its Problems)

The most straightforward approach might look like this:

```java
public class Navigator {
    public void navigate(String startPoint, String endPoint, String preferenceType) {
        if (preferenceType.equals("fastest")) {
            // Algorithm for fastest route
            System.out.println("Calculating fastest route from " + startPoint + " to " + endPoint);
            // More code...
        } 
        else if (preferenceType.equals("leastTraffic")) {
            // Algorithm for least traffic
            System.out.println("Calculating route with least traffic from " + startPoint + " to " + endPoint);
            // More code...
        }
        else if (preferenceType.equals("scenic")) {
            // Algorithm for scenic route
            System.out.println("Calculating scenic route from " + startPoint + " to " + endPoint);
            // More code...
        }
        else if (preferenceType.equals("publicTransport")) {
            // Algorithm for public transport
            System.out.println("Calculating public transport route from " + startPoint + " to " + endPoint);
            // More code...
        }
    }
}
```

This approach has several problems:

1. **Violates Open/Closed Principle** : To add a new strategy (like "most eco-friendly route"), you must modify the existing class.
2. **Complex Conditional Logic** : As strategies increase, the code becomes harder to maintain.
3. **Tight Coupling** : The Navigator class knows too much about all the different algorithms.
4. **Testing Difficulties** : Testing each strategy requires testing the entire class.

## 3. The Strategy Pattern Solution

The Strategy Pattern addresses these issues by:

1. Defining a family of algorithms (strategies)
2. Encapsulating each algorithm
3. Making the algorithms interchangeable

Here's the structure:

> The Strategy Pattern consists of three key components: the Strategy interface that defines the common method all concrete strategies must implement, the Concrete Strategy classes that provide different implementations of the algorithm, and the Context that uses a strategy.

Let's build this for our navigation example:

### Step 1: Create a Strategy Interface

```java
// The Strategy interface
public interface RouteStrategy {
    void calculateRoute(String startPoint, String endPoint);
}
```

### Step 2: Implement Concrete Strategies

```java
// Concrete Strategy 1
public class FastestRouteStrategy implements RouteStrategy {
    @Override
    public void calculateRoute(String startPoint, String endPoint) {
        System.out.println("Calculating fastest route from " + startPoint + " to " + endPoint);
        // Specific algorithm for fastest route...
    }
}

// Concrete Strategy 2
public class LeastTrafficRouteStrategy implements RouteStrategy {
    @Override
    public void calculateRoute(String startPoint, String endPoint) {
        System.out.println("Calculating route with least traffic from " + startPoint + " to " + endPoint);
        // Specific algorithm for least traffic route...
    }
}

// Concrete Strategy 3
public class ScenicRouteStrategy implements RouteStrategy {
    @Override
    public void calculateRoute(String startPoint, String endPoint) {
        System.out.println("Calculating scenic route from " + startPoint + " to " + endPoint);
        // Specific algorithm for scenic route...
    }
}

// Concrete Strategy 4
public class PublicTransportStrategy implements RouteStrategy {
    @Override
    public void calculateRoute(String startPoint, String endPoint) {
        System.out.println("Calculating public transport route from " + startPoint + " to " + endPoint);
        // Specific algorithm for public transport route...
    }
}
```

### Step 3: Create the Context

```java
// The Context
public class Navigator {
    private RouteStrategy strategy;
  
    // Set the strategy through constructor
    public Navigator(RouteStrategy strategy) {
        this.strategy = strategy;
    }
  
    // Allow changing strategy at runtime
    public void setStrategy(RouteStrategy strategy) {
        this.strategy = strategy;
    }
  
    // The context delegates the algorithm execution to the strategy
    public void navigate(String startPoint, String endPoint) {
        strategy.calculateRoute(startPoint, endPoint);
    }
}
```

### Step 4: Client Code Usage

```java
public class NavigationApp {
    public static void main(String[] args) {
        // Create strategies
        RouteStrategy fastestStrategy = new FastestRouteStrategy();
        RouteStrategy scenicStrategy = new ScenicRouteStrategy();
      
        // Create navigator with initial strategy
        Navigator navigator = new Navigator(fastestStrategy);
      
        // Navigate using the fastest strategy
        navigator.navigate("Home", "Office");
      
        // Change strategy and navigate again
        navigator.setStrategy(scenicStrategy);
        navigator.navigate("Home", "Office");
    }
}
```

## 4. Key Benefits of the Strategy Pattern

> The Strategy Pattern makes your code more adaptable, more maintainable, and more aligned with good design principles. It turns an implementation nightmare into a clean, extensible solution.

Let's examine these benefits:

1. **Open for Extension, Closed for Modification** : You can add new strategies without changing existing code.
2. **Eliminates Conditional Statements** : No more complex if-else or switch statements.
3. **Separation of Concerns** : Each strategy focuses solely on its specific algorithm.
4. **Runtime Flexibility** : Strategies can be swapped at runtime based on conditions or user inputs.
5. **Improved Testability** : Each strategy can be tested in isolation.
6. **Enhanced Readability** : The code structure clearly communicates intent.

## 5. Real-World Python Example: Sorting Algorithms

Let's implement the Strategy Pattern in Python for a practical use case: different sorting algorithms.

```python
# Strategy Interface (Python uses duck typing, so no explicit interface is needed)
class SortStrategy:
    def sort(self, data):
        pass  # This would be implemented by concrete strategies

# Concrete Strategies
class BubbleSortStrategy(SortStrategy):
    def sort(self, data):
        print("Sorting using bubble sort")
        # Simple bubble sort implementation
        data_copy = data.copy()  # Don't modify the original
        n = len(data_copy)
      
        for i in range(n):
            # Last i elements are already in place
            for j in range(0, n - i - 1):
                if data_copy[j] > data_copy[j + 1]:
                    # Swap elements
                    data_copy[j], data_copy[j + 1] = data_copy[j + 1], data_copy[j]
      
        return data_copy

class QuickSortStrategy(SortStrategy):
    def sort(self, data):
        print("Sorting using quick sort")
        # Simple quicksort implementation
        data_copy = data.copy()  # Don't modify the original
      
        if len(data_copy) <= 1:
            return data_copy
          
        pivot = data_copy[len(data_copy) // 2]
        left = [x for x in data_copy if x < pivot]
        middle = [x for x in data_copy if x == pivot]
        right = [x for x in data_copy if x > pivot]
      
        return self.sort(left) + middle + self.sort(right)

class MergeSortStrategy(SortStrategy):
    def sort(self, data):
        print("Sorting using merge sort")
        # Simple merge sort implementation
        data_copy = data.copy()  # Don't modify the original
      
        if len(data_copy) <= 1:
            return data_copy
          
        # Split the array into two halves
        mid = len(data_copy) // 2
        left_half = data_copy[:mid]
        right_half = data_copy[mid:]
      
        # Recursively sort both halves
        left_half = self.sort(left_half)
        right_half = self.sort(right_half)
      
        # Merge the sorted halves
        return self._merge(left_half, right_half)
  
    def _merge(self, left, right):
        result = []
        i = j = 0
      
        # Compare elements from both lists and add the smaller one to the result
        while i < len(left) and j < len(right):
            if left[i] < right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
      
        # Add any remaining elements
        result.extend(left[i:])
        result.extend(right[j:])
        return result

# Context
class Sorter:
    def __init__(self, strategy=None):
        self.strategy = strategy or BubbleSortStrategy()  # Default strategy
  
    def set_strategy(self, strategy):
        self.strategy = strategy
  
    def sort(self, data):
        return self.strategy.sort(data)

# Client code
def main():
    # Sample data
    data = [7, 1, 5, 2, 4, 3, 6]
  
    # Create sorter with default (bubble sort) strategy
    sorter = Sorter()
  
    print("Original data:", data)
  
    # Sort with bubble sort
    sorted_data = sorter.sort(data)
    print("Bubble sort result:", sorted_data)
  
    # Change to quick sort
    sorter.set_strategy(QuickSortStrategy())
    sorted_data = sorter.sort(data)
    print("Quick sort result:", sorted_data)
  
    # Change to merge sort
    sorter.set_strategy(MergeSortStrategy())
    sorted_data = sorter.sort(data)
    print("Merge sort result:", sorted_data)

if __name__ == "__main__":
    main()
```

When you run this code, you'll see each sorting algorithm being applied to the same data. The beauty is that the `Sorter` class (the context) doesn't need to know any details about how the sorting is done—it just delegates to the current strategy.

## 6. Strategy Pattern in Modern JavaScript (ES6+)

Let's see a more modern implementation using JavaScript:

```javascript
// Strategy interface is implicit in JavaScript

// Concrete Strategies
class EmailNotificationStrategy {
  notify(user, message) {
    console.log(`Sending email to ${user.email}: ${message}`);
    // Logic for sending an email
  }
}

class SMSNotificationStrategy {
  notify(user, message) {
    console.log(`Sending SMS to ${user.phone}: ${message}`);
    // Logic for sending an SMS
  }
}

class PushNotificationStrategy {
  notify(user, message) {
    console.log(`Sending push notification to ${user.deviceId}: ${message}`);
    // Logic for sending a push notification
  }
}

// Context
class NotificationService {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  notify(user, message) {
    if (!this.strategy) {
      throw new Error("Notification strategy not set");
    }
    this.strategy.notify(user, message);
  }
}

// Using the pattern with a modern JavaScript approach
const notifyUser = () => {
  const user = {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    deviceId: "device-123",
    preferences: { notificationType: "email" }  // User preference
  };
  
  const message = "Your order has been shipped!";
  
  // Create strategies
  const emailStrategy = new EmailNotificationStrategy();
  const smsStrategy = new SMSNotificationStrategy();
  const pushStrategy = new PushNotificationStrategy();
  
  // Create notification service with initial strategy based on user preference
  let initialStrategy;
  switch (user.preferences.notificationType) {
    case "email":
      initialStrategy = emailStrategy;
      break;
    case "sms":
      initialStrategy = smsStrategy;
      break;
    case "push":
      initialStrategy = pushStrategy;
      break;
    default:
      initialStrategy = emailStrategy; // Default
  }
  
  const notificationService = new NotificationService(initialStrategy);
  
  // Notify using the selected strategy
  notificationService.notify(user, message);
  
  // Later, change the strategy based on some condition
  if (message.includes("urgent")) {
    notificationService.setStrategy(smsStrategy);
    notificationService.notify(user, "URGENT: " + message);
  }
};

notifyUser();
```

## 7. Strategy Pattern with Functions Instead of Classes

In functional programming languages or when using a functional approach, we can implement the Strategy Pattern using functions instead of classes:

```javascript
// Strategy functions
const bubbleSort = (data) => {
  console.log("Using bubble sort");
  const arr = [...data]; // Create a copy
  
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  
  return arr;
};

const quickSort = (data) => {
  console.log("Using quick sort");
  const arr = [...data]; // Create a copy
  
  if (arr.length <= 1) {
    return arr;
  }
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
};

// Context function
const sortData = (data, strategy) => {
  return strategy(data);
};

// Usage
const data = [7, 1, 5, 2, 4, 3, 6];

console.log("Original data:", data);
console.log("Bubble sort result:", sortData(data, bubbleSort));
console.log("Quick sort result:", sortData(data, quickSort));
```

This approach is even more lightweight and flexible, as we're just passing functions around rather than creating class instances.

## 8. When to Use the Strategy Pattern

The Strategy Pattern is most useful when:

> Use the Strategy Pattern when you want to define a family of algorithms, encapsulate each one, and make them interchangeable. It lets the algorithm vary independently from clients that use it.

Specifically:

1. **Multiple Related Algorithms** : You have several different ways to accomplish the same task.
2. **Conditional Statements Getting Complex** : You find yourself writing large conditional statements to select behavior.
3. **Need for Runtime Selection** : The algorithm needs to be selected or switched during runtime.
4. **Isolating Algorithm Implementation** : You want to hide complex algorithmic details from the client.
5. **Avoiding Duplicate Code** : Different classes share similar behavior but in different ways.

## 9. Practical Example: Payment Processing

Let's finish with a real-world example that demonstrates the pattern's flexibility:

```python
# Payment strategy interface
class PaymentStrategy:
    def pay(self, amount):
        pass

# Concrete payment strategies
class CreditCardStrategy(PaymentStrategy):
    def __init__(self, name, card_number, cvv, expiration_date):
        self.name = name
        self.card_number = card_number
        self.cvv = cvv
        self.expiration_date = expiration_date
  
    def pay(self, amount):
        print(f"Paid ${amount} using Credit Card: {self.card_number[:4]}****")
        # Actual credit card processing logic would go here

class PayPalStrategy(PaymentStrategy):
    def __init__(self, email, password):
        self.email = email
        self.password = password
  
    def pay(self, amount):
        print(f"Paid ${amount} using PayPal account: {self.email}")
        # Actual PayPal processing logic would go here

class CryptocurrencyStrategy(PaymentStrategy):
    def __init__(self, wallet_address):
        self.wallet_address = wallet_address
  
    def pay(self, amount):
        print(f"Paid ${amount} equivalent in cryptocurrency to wallet: {self.wallet_address[:6]}...")
        # Actual cryptocurrency processing logic would go here

# Shopping cart context
class ShoppingCart:
    def __init__(self):
        self.items = []
        self.payment_strategy = None
  
    def add_item(self, item, price, quantity=1):
        self.items.append({"item": item, "price": price, "quantity": quantity})
  
    def calculate_total(self):
        return sum(item["price"] * item["quantity"] for item in self.items)
  
    def set_payment_strategy(self, payment_strategy):
        self.payment_strategy = payment_strategy
  
    def checkout(self):
        total = self.calculate_total()
        if not self.payment_strategy:
            raise Exception("Payment strategy not set")
      
        print(f"Checking out {len(self.items)} items:")
        for item in self.items:
            print(f"  - {item['item']} x{item['quantity']}: ${item['price'] * item['quantity']}")
        print(f"Total: ${total}")
      
        self.payment_strategy.pay(total)
        print("Thank you for your purchase!")

# Client code
def main():
    # Create shopping cart
    cart = ShoppingCart()
  
    # Add items
    cart.add_item("Laptop", 1200, 1)
    cart.add_item("Headphones", 100, 2)
  
    # Checkout process with credit card
    print("Choose your payment method:")
    print("1. Credit Card")
    print("2. PayPal")
    print("3. Cryptocurrency")
  
    # Simulate user choosing payment method
    choice = 1  # This would normally come from user input
  
    if choice == 1:
        payment_strategy = CreditCardStrategy(
            "John Doe", 
            "1234567890123456", 
            "123", 
            "12/25"
        )
    elif choice == 2:
        payment_strategy = PayPalStrategy(
            "john.doe@example.com", 
            "password123"  # In a real app, you wouldn't store this directly
        )
    elif choice == 3:
        payment_strategy = CryptocurrencyStrategy(
            "0x1234567890abcdef1234567890abcdef12345678"
        )
    else:
        print("Invalid choice")
        return
  
    cart.set_payment_strategy(payment_strategy)
    cart.checkout()

if __name__ == "__main__":
    main()
```

This example demonstrates how the Strategy Pattern lets users select different payment methods at runtime without the `ShoppingCart` class needing to know the details of each payment processing algorithm.

## 10. Summary

> The Strategy Pattern gives you a way to encapsulate a family of algorithms, make them interchangeable, and let the algorithm vary independently from the clients that use it.

To recap:

1. **Identify the varying part** (algorithm) that needs to be encapsulated.
2. **Create a common interface** (Strategy) for all variants.
3. **Implement concrete strategies** that adhere to the interface.
4. **Create a context** that uses strategies through composition.
5. **Allow clients** to select and change strategies as needed.

By following these steps, you create code that is:

* More maintainable
* More flexible
* More testable
* More aligned with the Open/Closed Principle

The Strategy Pattern is a powerful tool in your design pattern toolkit, helping you create more adaptable software that can easily accommodate changing requirements.
