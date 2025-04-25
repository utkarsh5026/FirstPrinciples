# Go String Manipulation and Formatting from First Principles

Let's start by understanding what strings really are in Go and then build up our knowledge of how to work with them effectively.

## 1. What Is a String in Go?

At the most fundamental level, a string in Go is an immutable sequence of bytes. This is quite different from some other languages where strings might be arrays of characters or mutable objects.

In Go, a string is:

* A read-only slice of bytes
* Encoded in UTF-8 by default
* Immutable (cannot be changed after creation)

Let's see this in practice:

```go
package main

import "fmt"

func main() {
    // A simple string in Go
    message := "Hello, World!"
  
    // Accessing individual bytes (not characters!)
    firstByte := message[0]
  
    fmt.Println(message)          // Prints: Hello, World!
    fmt.Printf("%v (type: %T)\n", firstByte, firstByte) // Prints: 72 (type: uint8)
    fmt.Printf("%c\n", firstByte) // Prints the character: H
}
```

In this example, when we access `message[0]`, we're getting the first byte of the string, which is the ASCII/UTF-8 value for 'H' (72). This is important because it leads us to an essential principle: individual bytes in a string aren't necessarily individual characters, especially with non-ASCII text.

## 2. UTF-8 and Runes

Go uses UTF-8 encoding, where some characters require multiple bytes. This is crucial to understand when working with international text.

A "rune" in Go represents a Unicode code point (essentially what we think of as a character). The `rune` type is an alias for `int32`.

```go
package main

import "fmt"

func main() {
    // A string with non-ASCII characters
    text := "Hello, 世界"
  
    // Print each rune and its position
    for i, runeValue := range text {
        fmt.Printf("%d: %c (%d bytes)\n", i, runeValue, len(string(runeValue)))
    }
}
```

Running this code would show something interesting:

* ASCII characters like 'H' take 1 byte
* The Chinese characters take 3 bytes each

This highlights why we need to be careful when iterating through strings - the index in the range loop isn't incrementing by 1 each time but is jumping ahead based on byte counts.

## 3. String Creation and Basic Operations

Let's explore the fundamental ways to create and manipulate strings:

```go
package main

import "fmt"

func main() {
    // String literals
    s1 := "Simple string"
    s2 := `Raw string literal that can 
           span multiple lines and include "quotes" without escaping`
  
    // String concatenation
    name := "Go"
    greeting := "Hello, " + name + "!"
  
    fmt.Println(s1)
    fmt.Println(s2)
    fmt.Println(greeting)
  
    // String length (in bytes!)
    fmt.Println("Length of greeting:", len(greeting))
  
    // Substrings using slicing
    // Gets bytes from index 0 to 4 (exclusive)
    substring := greeting[0:5]
    fmt.Println("Substring:", substring)
}
```

Key principles here:

* Regular strings use double quotes `""`
* Raw string literals use backticks  and preserve formatting/newlines
* `+` operator concatenates strings
* `len()` returns the number of bytes, not characters
* Slicing syntax `[start:end]` works on byte positions

## 4. String Immutability

A fundamental principle of Go strings is their immutability. You cannot modify a string once created:

```go
package main

import "fmt"

func main() {
    greeting := "hello"
  
    // This will NOT work - strings are immutable
    // greeting[0] = 'H'  // Uncommenting this would cause a compilation error
  
    // Instead, create a new string
    updatedGreeting := "H" + greeting[1:]
    fmt.Println(updatedGreeting)  // Prints: Hello
  
    // Another approach using byte slices
    bytes := []byte(greeting)
    bytes[0] = 'H'
    updatedGreeting2 := string(bytes)
    fmt.Println(updatedGreeting2)  // Prints: Hello
}
```

The immutability principle leads to a common pattern in Go: converting strings to byte slices (`[]byte`), modifying the bytes, then converting back to strings. This creates new string values rather than modifying existing ones.

## 5. String Comparison

String comparison in Go works as you might expect:

```go
package main

import (
    "fmt"
    "strings"
)

func main() {
    s1 := "apple"
    s2 := "banana"
    s3 := "APPLE"
  
    // Direct comparison (case-sensitive)
    fmt.Println("s1 == s2:", s1 == s2)  // false
    fmt.Println("s1 != s2:", s1 != s2)  // true
  
    // Case-insensitive comparison
    fmt.Println("s1 equals s3 (ignoring case):", 
                strings.EqualFold(s1, s3))  // true
  
    // Lexicographical comparison
    fmt.Println("s1 < s2:", s1 < s2)  // true (a comes before b)
}
```

The `==` and `!=` operators compare the byte sequences exactly, while `strings.EqualFold()` provides case-insensitive comparison. The `<` and `>` operators compare strings lexicographically (dictionary order).

## 6. The strings Package

The `strings` package is essential for string manipulation in Go. Let's explore some of its most useful functions:

```go
package main

import (
    "fmt"
    "strings"
)

func main() {
    text := "Go is a powerful language. Go is fast."
  
    // Contains, HasPrefix, HasSuffix
    fmt.Println(strings.Contains(text, "powerful"))       // true
    fmt.Println(strings.HasPrefix(text, "Go"))            // true
    fmt.Println(strings.HasSuffix(text, "language."))     // false
  
    // Finding positions
    fmt.Println(strings.Index(text, "is"))                // 3
    fmt.Println(strings.LastIndex(text, "Go"))            // 25
  
    // Count occurrences
    fmt.Println(strings.Count(text, "Go"))                // 2
  
    // Replacing
    newText := strings.Replace(text, "Go", "Golang", 1)   // Replace first occurrence
    fmt.Println(newText)
    allReplaced := strings.ReplaceAll(text, "Go", "Golang")
    fmt.Println(allReplaced)
  
    // Splitting
    parts := strings.Split(text, ".")
    fmt.Println(parts)                                    // ["Go is a powerful language", " Go is fast", ""]
  
    // Join
    joined := strings.Join([]string{"Go", "is", "awesome"}, " ")
    fmt.Println(joined)                                   // Go is awesome
  
    // Convert case
    fmt.Println(strings.ToUpper(text))
    fmt.Println(strings.ToLower(text))
  
    // Trim spaces
    spaceyText := "   trim me   "
    fmt.Println("|" + strings.TrimSpace(spaceyText) + "|") // |trim me|
}
```

This examples demonstrates many common string operations. Let's analyze a few:

* `Contains`, `HasPrefix`, and `HasSuffix` check for substrings in particular positions
* `Index` and `LastIndex` find positions of substrings
* `Replace` and `ReplaceAll` create new strings with substitutions
* `Split` divides a string into a slice of strings based on a separator
* `Join` combines a slice of strings with a separator
* `TrimSpace` removes whitespace from both ends of a string

## 7. Building Strings Efficiently

When you need to build strings incrementally, the `+` operator is inefficient because it creates a new string each time. The `strings.Builder` type solves this problem:

```go
package main

import (
    "fmt"
    "strings"
)

func main() {
    // Inefficient way (creates multiple temporary strings)
    start := time.Now()
    var result string
    for i := 0; i < 1000; i++ {
        result += "a"
    }
    fmt.Println("String concatenation took:", time.Since(start))
  
    // Efficient way using strings.Builder
    start = time.Now()
    var builder strings.Builder
    for i := 0; i < 1000; i++ {
        builder.WriteString("a")
    }
    efficientResult := builder.String()
    fmt.Println("StringBuilder took:", time.Since(start))
  
    // They produce the same result
    fmt.Println("Results are equal:", result == efficientResult)
}
```

The `strings.Builder` is much more efficient because it minimizes memory allocations and copying. It works by maintaining a growable buffer internally.

Key methods of `strings.Builder`:

* `WriteString()` - Appends a string
* `WriteRune()` - Appends a rune (Unicode character)
* `WriteByte()` - Appends a byte
* `String()` - Gets the resulting string

## 8. String Formatting with fmt Package

String formatting in Go is primarily done with the `fmt` package. Let's explore the powerful `Printf` function and its formatting verbs:

```go
package main

import "fmt"

func main() {
    name := "Go"
    version := 1.18
    isAwesome := true
  
    // Basic formatters
    fmt.Printf("Language: %s\n", name)             // String
    fmt.Printf("Version: %.2f\n", version)         // Float with 2 decimal places
    fmt.Printf("Is awesome? %t\n", isAwesome)      // Boolean
  
    // Width and alignment
    fmt.Printf("|%-10s|%10s|\n", "Left", "Right")  // Left and right aligned
  
    // Integer formats
    num := 42
    fmt.Printf("Decimal: %d\n", num)               // 42
    fmt.Printf("Binary: %b\n", num)                // 101010
    fmt.Printf("Octal: %o\n", num)                 // 52
    fmt.Printf("Hexadecimal: %x\n", num)           // 2a
  
    // Type information
    fmt.Printf("Type of name: %T\n", name)         // string
  
    // Go-syntax representation
    complex := struct {
        Name string
        Age  int
    }{"Alice", 30}
    fmt.Printf("Go syntax: %#v\n", complex)        // struct{Name string; Age int}{Name:"Alice", Age:30}
  
    // Character (Unicode code point)
    fmt.Printf("Character: %c\n", 'A')             // A
  
    // Creating a formatted string (without printing)
    formatted := fmt.Sprintf("Hello, %s! Version %.1f", name, version)
    fmt.Println(formatted)                         // Hello, Go! Version 1.2
}
```

Common formatting verbs:

* `%s` - String
* `%d` - Decimal integer
* `%f` - Float
* `%t` - Boolean
* `%v` - Value in default format
* `%#v` - Go-syntax representation
* `%T` - Type
* `%c` - Character
* `%p` - Pointer
* `%b` - Binary
* `%o` - Octal
* `%x` - Hexadecimal

Modifiers:

* `-` for left alignment
* Number for width (e.g., `%10s`)
* `.number` for precision (e.g., `%.2f`)

## 9. Working with Unicode and International Text

Go's built-in support for UTF-8 makes it excellent for international text:

```go
package main

import (
    "fmt"
    "unicode"
    "unicode/utf8"
)

func main() {
    text := "Hello, 世界! こんにちは"
  
    // Get the actual character count (not byte count)
    runeCount := utf8.RuneCountInString(text)
    fmt.Printf("Byte length: %d, Rune count: %d\n", len(text), runeCount)
  
    // Iterate by runes (characters), not bytes
    for _, r := range text {
        fmt.Printf("%c - Unicode: %U - Is letter? %t\n", 
                  r, r, unicode.IsLetter(r))
    }
  
    // Decoding specific runes
    firstRune, size := utf8.DecodeRuneInString(text)
    fmt.Printf("First rune: %c (takes %d bytes)\n", firstRune, size)
  
    // Working with the unicode package
    japaneseChar := '本'
    fmt.Printf("Is Japanese? %t\n", unicode.In(japaneseChar, unicode.Hiragana, unicode.Katakana, unicode.Han))
}
```

This example shows:

* How to count actual characters using `utf8.RuneCountInString`
* How to iterate through characters using the `range` keyword
* How to decode individual runes with `utf8.DecodeRuneInString`
* How to use the `unicode` package to check character properties

## 10. Real-World Examples

Let's look at some practical examples that combine multiple concepts:

### Example 1: Validating User Input

```go
package main

import (
    "fmt"
    "strings"
    "unicode"
)

func isValidUsername(username string) (bool, string) {
    // Must be between 3 and 20 characters
    if utf8.RuneCountInString(username) < 3 || utf8.RuneCountInString(username) > 20 {
        return false, "Username must be between 3 and 20 characters"
    }
  
    // Must start with a letter
    firstRune, _ := utf8.DecodeRuneInString(username)
    if !unicode.IsLetter(firstRune) {
        return false, "Username must start with a letter"
    }
  
    // May only contain letters, numbers, and underscores
    for _, r := range username {
        if !unicode.IsLetter(r) && !unicode.IsDigit(r) && r != '_' {
            return false, "Username may only contain letters, numbers, and underscores"
        }
    }
  
    return true, "Username is valid"
}

func main() {
    usernames := []string{"john_doe", "123abc", "valid_user123", "invalid-user"}
  
    for _, username := range usernames {
        valid, message := isValidUsername(username)
        fmt.Printf("Username '%s': %s\n", username, message)
    }
}
```

This example:

* Validates usernames based on length and character content
* Uses rune counting to properly handle international characters
* Checks specific character types using the `unicode` package

### Example 2: Parsing CSV Data

```go
package main

import (
    "fmt"
    "strings"
)

func parseCSV(data string) []map[string]string {
    lines := strings.Split(data, "\n")
    if len(lines) < 2 {
        return nil // Need at least header and one data row
    }
  
    // Parse header
    headers := strings.Split(lines[0], ",")
  
    // Parse data rows
    var result []map[string]string
    for i := 1; i < len(lines); i++ {
        if strings.TrimSpace(lines[i]) == "" {
            continue // Skip empty lines
        }
      
        fields := strings.Split(lines[i], ",")
        record := make(map[string]string)
      
        for j := 0; j < len(headers) && j < len(fields); j++ {
            record[strings.TrimSpace(headers[j])] = strings.TrimSpace(fields[j])
        }
      
        result = append(result, record)
    }
  
    return result
}

func main() {
    csvData := `name,age,city
John Doe,28,New York
Jane Smith,32,San Francisco
Bob Johnson,45,Chicago`
  
    records := parseCSV(csvData)
  
    // Print all records
    for i, record := range records {
        fmt.Printf("Record %d:\n", i+1)
        for key, value := range record {
            fmt.Printf("  %s: %s\n", key, value)
        }
    }
}
```

This example:

* Parses CSV data into a structured format
* Uses multiple string functions: `Split`, `TrimSpace`
* Builds up a result data structure from string input

### Example 3: Template Rendering

```go
package main

import (
    "bytes"
    "fmt"
    "strings"
)

// Simple template engine
func renderTemplate(template string, data map[string]string) string {
    result := template
  
    // Replace all placeholders
    for key, value := range data {
        placeholder := "{{" + key + "}}"
        result = strings.ReplaceAll(result, placeholder, value)
    }
  
    return result
}

func main() {
    template := `Hello, {{name}}!

We're pleased to inform you that your application for the {{position}} 
position at {{company}} has been accepted.

Your start date will be {{startDate}}.

Best regards,
{{manager}}
{{department}} Department`

    data := map[string]string{
        "name":       "Alice Smith",
        "position":   "Software Engineer",
        "company":    "TechCorp",
        "startDate":  "January 15, 2023",
        "manager":    "Bob Johnson",
        "department": "Engineering",
    }
  
    rendered := renderTemplate(template, data)
    fmt.Println(rendered)
}
```

This example:

* Creates a simple template engine that replaces placeholders
* Uses `strings.ReplaceAll` for substitutions
* Shows how strings can be used for document generation

## 11. Advanced String Formatting with text/template

For more advanced string formatting, Go provides the `text/template` package:

```go
package main

import (
    "fmt"
    "os"
    "text/template"
)

type Person struct {
    Name    string
    Age     int
    Hobbies []string
}

func main() {
    // Define the template
    templateText := `
Name: {{.Name}}
Age: {{.Age}}
{{if ge .Age 18}}Status: Adult{{else}}Status: Minor{{end}}

Hobbies:
{{range .Hobbies}}
- {{.}}{{end}}

{{if .Hobbies}}
You have {{len .Hobbies}} hobbies.
{{else}}
You don't have any hobbies listed.
{{end}}
`

    // Parse the template
    tmpl, err := template.New("person").Parse(templateText)
    if err != nil {
        fmt.Println("Error parsing template:", err)
        return
    }
  
    // Create data
    person := Person{
        Name:    "Alice Smith",
        Age:     28,
        Hobbies: []string{"Reading", "Hiking", "Photography"},
    }
  
    // Execute the template
    err = tmpl.Execute(os.Stdout, person)
    if err != nil {
        fmt.Println("Error executing template:", err)
    }
}
```

The `text/template` package offers powerful features:

* Conditional statements (`if`, `else`)
* Loops (`range`)
* Built-in functions (`len`, `ge` for greater than or equal)
* Access to fields and methods of structs

## Conclusion

Go's approach to strings follows several core principles:

1. Strings are immutable sequences of bytes
2. UTF-8 is the default encoding, with strong Unicode support via runes
3. The standard library provides comprehensive tools for string manipulation
4. String formatting is powerful and flexible
5. For performance-critical code, specialized tools like `strings.Builder` can optimize string operations

When working with strings in Go, always remember:

* Think in terms of bytes and runes, not just "characters"
* Be aware of UTF-8 encoding when dealing with international text
* Use the right tool for the job (direct operations for simple cases, builder for complex ones)
* The standard library provides almost everything you need via the `strings`, `unicode`, `fmt`, and related packages

By understanding these principles and tools, you can handle Go string manipulation and formatting with confidence and efficiency.
