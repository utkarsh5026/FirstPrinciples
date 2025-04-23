
# Go Programming Language - Basic Syntax and Structure

Go (or Golang) was designed with simplicity and practicality in mind. Let's explore its basic syntax and structure from first principles, building up our understanding step by step.

## 1. The Fundamental Building Blocks

At its core, Go programs are constructed from packages, which contain declarations and statements. Let's start by understanding the basic structure of a Go program.

### 1.1 Hello World - Our First Program

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

Let's break down what's happening here:

* `package main`: Declares that this file belongs to the 'main' package. The main package is special because it defines an executable program rather than a library.
* `import "fmt"`: Imports the formatting package, which contains functions for input/output operations.
* `func main()`: Defines the main function, which is the entry point of our program. When you run a Go program, execution begins in the main function.
* `fmt.Println("Hello, World!")`: Calls the Println function from the fmt package to print text to the console.

## 2. Packages and Imports

Go programs are organized into packages. A package is a collection of Go source files in the same directory.

### 2.1 Package Declaration

Every Go file starts with a package declaration:

```go
package packagename
```

For executable programs, the package must be named `main`. For libraries, you can choose any name that makes sense for your code.

### 2.2 Import Statements

After the package declaration, you typically list the packages you want to import:

```go
import (
    "fmt"
    "math"
    "strings"
)
```

This block style is equivalent to multiple single imports:

```go
import "fmt"
import "math"
import "strings"
```

You can also give imported packages aliases:

```go
import (
    f "fmt"
    m "math"
)

func main() {
    f.Println(m.Pi) // Using the aliases
}
```

## 3. Variables and Data Types

Go is statically typed, meaning variables must have a defined type at compile time.

### 3.1 Variable Declarations

There are several ways to declare variables in Go:

```go
// Long form
var name string = "John"

// Type inference
var age = 30

// Short declaration (only inside functions)
count := 5
```

Let's see these in action:

```go
package main

import "fmt"

func main() {
    // Different ways to declare variables
    var name string = "John"
    var age = 30
    count := 5
  
    fmt.Println("Name:", name)
    fmt.Println("Age:", age)
    fmt.Println("Count:", count)
}
```

### 3.2 Basic Data Types

Go has several basic data types:

```go
var intVar int = 42            // Integer
var floatVar float64 = 3.14    // Floating point
var stringVar string = "Hello" // String
var boolVar bool = true        // Boolean
```

Let's see how these types work with a simple example:

```go
package main

import "fmt"

func main() {
    // Basic data types
    var i int = 42
    var f float64 = 3.14159
    var s string = "Hello, Go!"
    var b bool = true
  
    // Printing values and their types
    fmt.Printf("i: %v (type: %T)\n", i, i)
    fmt.Printf("f: %v (type: %T)\n", f, f)
    fmt.Printf("s: %v (type: %T)\n", s, s)
    fmt.Printf("b: %v (type: %T)\n", b, b)
}
```

The output would be:

```
i: 42 (type: int)
f: 3.14159 (type: float64)
s: Hello, Go! (type: string)
b: true (type: bool)
```

### 3.3 Zero Values

When you declare a variable without an explicit initial value, Go assigns it a zero value:

```go
var i int       // 0
var f float64   // 0.0
var s string    // "" (empty string)
var b bool      // false
```

## 4. Constants

Constants are values that cannot be changed during program execution:

```go
const Pi = 3.14159
const (
    StatusOK = 200
    StatusNotFound = 404
)
```

Let's see constants in action:

```go
package main

import "fmt"

const (
    Sunday = iota
    Monday
    Tuesday
    Wednesday
    Thursday
    Friday
    Saturday
)

func main() {
    const greeting = "Hello, constants!"
    fmt.Println(greeting)
  
    // iota creates a sequence of related constants
    fmt.Println("Sunday is day:", Sunday)
    fmt.Println("Wednesday is day:", Wednesday)
}
```

The `iota` identifier generates a sequence of related constants. In this example, Sunday=0, Monday=1, etc.

## 5. Functions

Functions are central to Go programming. They encapsulate code and make it reusable.

### 5.1 Basic Function Declaration

```go
func functionName(parameter1 type1, parameter2 type2) returnType {
    // Function body
    return value
}
```

Let's see a simple function example:

```go
package main

import "fmt"

// Function that adds two integers
func add(x int, y int) int {
    return x + y
}

func main() {
    result := add(5, 7)
    fmt.Println("5 + 7 =", result)
}
```

### 5.2 Multiple Return Values

Go functions can return multiple values:

```go
package main

import "fmt"

// Function that returns two values
func divide(x, y float64) (float64, error) {
    if y == 0 {
        return 0, fmt.Errorf("cannot divide by zero")
    }
    return x / y, nil
}

func main() {
    result, err := divide(10, 2)
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("10 / 2 =", result)
    }
  
    // Trying division by zero
    result, err = divide(10, 0)
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("10 / 0 =", result)
    }
}
```

### 5.3 Named Return Values

Go allows you to name return values:

```go
func rectangle(width, height float64) (area, perimeter float64) {
    area = width * height
    perimeter = 2 * (width + height)
    return // naked return - returns the named values
}
```

## 6. Control Structures

Go has several control structures for directing program flow.

### 6.1 If-Else Statements

```go
package main

import "fmt"

func main() {
    x := 10
  
    if x > 5 {
        fmt.Println("x is greater than 5")
    } else if x == 5 {
        fmt.Println("x equals 5")
    } else {
        fmt.Println("x is less than 5")
    }
  
    // If with a short statement
    if y := x * 2; y > 15 {
        fmt.Println("y is greater than 15")
    } else {
        fmt.Println("y is not greater than 15")
    }
    // Note: y is not accessible here
}
```

The `if` statement can start with a short statement to execute before the condition.

### 6.2 For Loops

Go has only one looping construct: the `for` loop.

```go
package main

import "fmt"

func main() {
    // Traditional for loop
    for i := 0; i < 5; i++ {
        fmt.Println("i:", i)
    }
  
    // For as a while loop
    sum := 1
    for sum < 10 {
        sum += sum
        fmt.Println("sum:", sum)
    }
  
    // Infinite loop with a break
    counter := 0
    for {
        counter++
        fmt.Println("counter:", counter)
        if counter >= 3 {
            break
        }
    }
  
    // For-range loop for iterating over collections
    fruits := []string{"apple", "banana", "cherry"}
    for index, value := range fruits {
        fmt.Printf("Index: %d, Value: %s\n", index, value)
    }
}
```

### 6.3 Switch Statements

Switch statements provide a cleaner way to write multiple if-else statements:

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    today := time.Now().Weekday()
  
    switch today {
    case time.Saturday, time.Sunday:
        fmt.Println("It's the weekend!")
    default:
        fmt.Println("It's a weekday")
    }
  
    // Switch without an expression is like if-else
    t := time.Now()
    switch {
    case t.Hour() < 12:
        fmt.Println("Good morning!")
    case t.Hour() < 17:
        fmt.Println("Good afternoon!")
    default:
        fmt.Println("Good evening!")
    }
}
```

## 7. Composite Types

Go provides several composite types for organizing data.

### 7.1 Arrays

Arrays have a fixed size:

```go
package main

import "fmt"

func main() {
    // Declare an array of 5 integers
    var numbers [5]int
  
    // Initialize specific elements
    numbers[0] = 10
    numbers[1] = 20
  
    // Array literal
    cities := [3]string{"New York", "London", "Tokyo"}
  
    // Let the compiler count the size
    countries := [...]string{"USA", "UK", "Japan", "Australia"}
  
    fmt.Println("Numbers:", numbers)
    fmt.Println("Cities:", cities)
    fmt.Println("Countries:", countries)
    fmt.Println("Number of countries:", len(countries))
}
```

### 7.2 Slices

Slices are more flexible than arrays and are used more frequently:

```go
package main

import "fmt"

func main() {
    // Create a slice
    numbers := []int{1, 2, 3, 4, 5}
    fmt.Println("Original slice:", numbers)
  
    // Slice of a slice
    slice2 := numbers[1:3]
    fmt.Println("Slice of elements 1-2:", slice2)
  
    // Changing the slice affects the original
    slice2[0] = 20
    fmt.Println("After modifying slice2:", numbers)
  
    // Append to a slice
    numbers = append(numbers, 6, 7)
    fmt.Println("After append:", numbers)
  
    // Create a slice with make
    s := make([]int, 3, 5) // length 3, capacity 5
    fmt.Printf("Length: %d, Capacity: %d\n", len(s), cap(s))
}
```

### 7.3 Maps

Maps are Go's built-in associative data type (hash tables):

```go
package main

import "fmt"

func main() {
    // Create a map
    person := map[string]string{
        "name": "John",
        "country": "USA",
    }
  
    // Access elements
    fmt.Println("Name:", person["name"])
  
    // Add or update
    person["job"] = "Developer"
  
    // Check if a key exists
    job, exists := person["job"]
    if exists {
        fmt.Println("Job:", job)
    }
  
    // Delete a key
    delete(person, "country")
  
    // Iterate over a map
    for key, value := range person {
        fmt.Printf("%s: %s\n", key, value)
    }
}
```

### 7.4 Structs

Structs group related data together:

```go
package main

import "fmt"

// Define a struct
type Person struct {
    Name string
    Age int
    Address Address
}

type Address struct {
    Street string
    City string
    Country string
}

func main() {
    // Create a struct
    p1 := Person{
        Name: "John",
        Age: 30,
        Address: Address{
            Street: "123 Main St",
            City: "New York",
            Country: "USA",
        },
    }
  
    // Access fields
    fmt.Println("Name:", p1.Name)
    fmt.Println("City:", p1.Address.City)
  
    // Modify fields
    p1.Age = 31
    fmt.Println("Updated age:", p1.Age)
}
```

## 8. Methods

Methods are functions associated with a particular type:

```go
package main

import (
    "fmt"
    "math"
)

// Define a type
type Circle struct {
    Radius float64
}

// Method with a receiver
func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

// Method with a pointer receiver
func (c *Circle) Expand(factor float64) {
    c.Radius *= factor
}

func main() {
    c := Circle{Radius: 5}
    fmt.Printf("Circle with radius %.2f has area %.2f\n", c.Radius, c.Area())
  
    c.Expand(2)
    fmt.Printf("After expansion, radius is %.2f and area is %.2f\n", c.Radius, c.Area())
}
```

The key difference between the two methods:

* `Area()` just reads the radius, so it uses a value receiver.
* `Expand()` modifies the radius, so it uses a pointer receiver to affect the original Circle.

## 9. Interfaces

Interfaces define behavior by declaring a set of methods:

```go
package main

import (
    "fmt"
    "math"
)

// Define an interface
type Shape interface {
    Area() float64
    Perimeter() float64
}

// Circle implements Shape
type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * math.Pi * c.Radius
}

// Rectangle implements Shape
type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
    return 2 * (r.Width + r.Height)
}

// Function that works with any Shape
func printShapeInfo(s Shape) {
    fmt.Printf("Area: %.2f\n", s.Area())
    fmt.Printf("Perimeter: %.2f\n", s.Perimeter())
}

func main() {
    c := Circle{Radius: 5}
    r := Rectangle{Width: 3, Height: 4}
  
    fmt.Println("Circle:")
    printShapeInfo(c)
  
    fmt.Println("\nRectangle:")
    printShapeInfo(r)
}
```

Here, both Circle and Rectangle implement the Shape interface by providing Area() and Perimeter() methods.

## 10. Error Handling

Go handles errors through explicit returns rather than exceptions:

```go
package main

import (
    "fmt"
    "errors"
)

// Function that can return an error
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("cannot divide by zero")
    }
    return a / b, nil
}

func main() {
    // Successful case
    result, err := divide(10, 2)
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("10 / 2 =", result)
    }
  
    // Error case
    result, err = divide(10, 0)
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("10 / 0 =", result)
    }
}
```

## 11. Concurrency

Go has built-in support for concurrent programming with goroutines and channels.

### 11.1 Goroutines

Goroutines are lightweight threads managed by the Go runtime:

```go
package main

import (
    "fmt"
    "time"
)

func sayHello(message string) {
    for i := 0; i < 3; i++ {
        fmt.Println(message, i)
        time.Sleep(100 * time.Millisecond)
    }
}

func main() {
    // Start a goroutine
    go sayHello("Hello from goroutine")
  
    // Run in main goroutine
    sayHello("Hello from main")
  
    // Note: In a real program, you'd need synchronization here
    // to prevent the program from exiting before the goroutine completes
}
```

### 11.2 Channels

Channels allow goroutines to communicate and synchronize:

```go
package main

import "fmt"

func sum(numbers []int, resultChan chan int) {
    sum := 0
    for _, num := range numbers {
        sum += num
    }
    resultChan <- sum // Send result to channel
}

func main() {
    numbers := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
  
    // Create a channel
    resultChan := make(chan int)
  
    // Split the work between two goroutines
    go sum(numbers[:len(numbers)/2], resultChan)
    go sum(numbers[len(numbers)/2:], resultChan)
  
    // Receive results from both goroutines
    part1 := <-resultChan
    part2 := <-resultChan
  
    fmt.Println("Sum of first half:", part1)
    fmt.Println("Sum of second half:", part2)
    fmt.Println("Total sum:", part1+part2)
}
```

## 12. Deferred Function Calls

The `defer` statement schedules a function call to be executed after the surrounding function returns:

```go
package main

import "fmt"

func main() {
    fmt.Println("Start")
  
    // This will execute after main() finishes
    defer fmt.Println("Deferred statement 1")
  
    // Multiple defers execute in LIFO order
    defer fmt.Println("Deferred statement 2")
  
    fmt.Println("End")
}
```

Output:

```
Start
End
Deferred statement 2
Deferred statement 1
```

Defer is commonly used for cleanup operations:

```go
package main

import (
    "fmt"
    "os"
)

func readFile(filename string) {
    file, err := os.Open(filename)
    if err != nil {
        fmt.Println("Error opening file:", err)
        return
    }
    defer file.Close() // This ensures the file is closed even if we encounter errors
  
    // Read and process file...
    fmt.Println("File opened successfully")
}

func main() {
    readFile("example.txt")
}
```

## Conclusion

We've covered the basic syntax and structure of Go, working through its fundamental components:

1. Program structure, packages, and imports
2. Variables, constants, and basic data types
3. Functions and methods
4. Control structures (if, for, switch)
5. Composite types (arrays, slices, maps, structs)
6. Interfaces for defining behavior
7. Error handling
8. Concurrency with goroutines and channels
9. Deferred function calls

Go's syntax is designed to be clean and straightforward, emphasizing readability and maintainability. The language provides powerful features like concurrency primitives and interfaces while avoiding unnecessary complexity.

By understanding these fundamentals, you now have a solid foundation for building programs in Go. As you continue learning, you'll discover how these basic elements can be combined to create robust, efficient applications.
