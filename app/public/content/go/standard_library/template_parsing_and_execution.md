# Go Templates: Parsing and Execution from First Principles

Templates in Go provide a powerful way to generate textual output based on data. When we talk about Go templates, we're primarily referring to the packages `text/template` and `html/template` in the standard library. Let me walk you through how template parsing and execution work from the ground up.

## What Are Templates?

At their core, templates are documents containing text with embedded instructions. These instructions tell the template engine how to transform input data into formatted output.

Think of a template as a letter with blanks to fill in. The template defines the structure, and the data you provide fills in the gaps.

## The Template Lifecycle

Before diving into details, let's understand the high-level process:

1. Create a template object
2. Parse template content into an internal representation
3. Execute the template with data to produce output

This looks deceptively simple, but there's significant complexity under the hood.

## Template Creation

Let's start with creating a template:

```go
import "text/template"

// Create a new template with a name
tmpl := template.New("greeting")
```

This creates an empty template named "greeting". The name is important because:

* It serves as an identifier when working with multiple templates
* It's used in error messages
* Templates can reference each other by name

## Template Parsing

Once we have a template object, we need to give it content to parse. This is where template parsing happens.

```go
// Parse a template string
parsed, err := tmpl.Parse("Hello, {{.Name}}!")
if err != nil {
    // Handle parsing error
}
```

What happens during parsing? The template engine:

1. Tokenizes the input string, breaking it into plain text and actions
2. Builds a syntax tree representing the template structure
3. Validates the template for correctness

Let's break this down further:

### Tokenization

The parser scans through the template string character by character, identifying:

* Plain text (copied verbatim to output)
* Actions (instructions enclosed in `{{` and `}}`)

For example, in `"Hello, {{.Name}}!"`:

* "Hello, " is plain text
* "{{.Name}}" is an action that accesses the "Name" field of the data

### Building the Syntax Tree

The parser constructs a tree structure where:

* Nodes represent elements of the template
* Leaf nodes are text or simple actions
* Branch nodes are control structures (if/else, range, etc.)

For our simple example, the tree would be:

* Root
  * TextNode ("Hello, ")
  * ActionNode (dot followed by field "Name")
  * TextNode ("!")

### Validation

The parser checks for:

* Balanced delimiters (`{{` and `}}`)
* Valid actions and functions
* Correct use of control structures
* Proper variable references

If any errors are found, parsing fails and returns an error.

## Template Execution

After parsing, we can execute the template with data:

```go
// Create data to use with the template
data := struct {
    Name string
}{"Alice"}

// Execute the template with the data
err = parsed.Execute(os.Stdout, data)
if err != nil {
    // Handle execution error
}
```

When this code runs, it will output: `Hello, Alice!`

Let's examine what happens during execution:

1. The template engine traverses the syntax tree
2. For each node:
   * TextNodes are copied directly to output
   * ActionNodes are evaluated against the data
   * ControlNodes determine flow based on data

### The Data Context

In templates, the dot (`.`) represents the current data context. Initially, this is the data you pass to `Execute()`. As the template executes, this context can change within control structures.

For example:

* `.Name` accesses the Name field of the current context
* `.` represents the entire current context
* `{{with .User}}` changes the context to the User field

### Detailed Example with Context Changes

```go
const templateText = `
Hello, {{.Name}}!
{{with .Address}}
You live at:
  {{.Street}}
  {{.City}}, {{.State}} {{.Zip}}
{{end}}
`

data := struct {
    Name    string
    Address struct {
        Street string
        City   string
        State  string
        Zip    string
    }
}{
    Name: "Bob",
    Address: struct {
        Street string
        City   string
        State  string
        Zip    string
    }{
        Street: "123 Main St",
        City:   "Anytown",
        State:  "NY",
        Zip:    "10001",
    },
}

tmpl, err := template.New("letter").Parse(templateText)
if err != nil {
    // Handle error
}

err = tmpl.Execute(os.Stdout, data)
if err != nil {
    // Handle error
}
```

During execution:

1. Outside any blocks, `.` is the entire data structure
2. Inside `{{with .Address}}`, `.` becomes the Address struct
3. So `.Street` refers to Address.Street, not data.Address.Street

## Template Functions

Templates can use functions to transform data. Go provides built-in functions and allows you to add custom ones.

```go
// Create a template with a custom function
funcs := template.FuncMap{
    "upper": strings.ToUpper,
    "add": func(a, b int) int {
        return a + b
    },
}

tmpl := template.New("test").Funcs(funcs)

// Parse a template that uses the functions
parsed, err := tmpl.Parse("Hello, {{upper .Name}}! Next year you'll be {{add .Age 1}}.")
if err != nil {
    // Handle error
}

// Execute with data
data := struct {
    Name string
    Age  int
}{"Charlie", 29}

err = parsed.Execute(os.Stdout, data)
if err != nil {
    // Handle error
}
```

This outputs: `Hello, CHARLIE! Next year you'll be 30.`

Functions must be registered before parsing the template. During execution, the engine:

1. Identifies function calls in actions
2. Evaluates arguments
3. Calls the function with those arguments
4. Uses the result in the output

## Template Nesting and Including Templates

Templates can include other templates, which is powerful for reuse and modularity.

```go
const baseTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>{{.Title}}</title>
</head>
<body>
    <h1>{{.Title}}</h1>
    {{template "content" .}}
</body>
</html>
`

const contentTemplate = `
{{define "content"}}
<p>Welcome, {{.User}}!</p>
<p>Today is {{.Today}}.</p>
{{end}}
`

// Create and parse template set
tmpl := template.New("base")
_, err := tmpl.Parse(baseTemplate)
if err != nil {
    // Handle error
}

_, err = tmpl.New("content").Parse(contentTemplate)
if err != nil {
    // Handle error
}

// Execute the base template
data := struct {
    Title string
    User  string
    Today string
}{
    Title: "Welcome Page",
    User:  "David",
    Today: "Monday",
}

err = tmpl.Execute(os.Stdout, data)
if err != nil {
    // Handle error
}
```

When parsing multiple templates:

1. Each template is parsed into the same template set
2. Templates can reference each other by name
3. The `{{template "name" .}}` action includes another template
4. The dot after the name passes the current context to the included template

### Template Blocks and Inheritance

Go templates support a form of inheritance with blocks:

```go
const masterTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>{{block "title" .}}Default Title{{end}}</title>
</head>
<body>
    <header>Site Header</header>
    <main>
        {{block "content" .}}
        <p>Default content</p>
        {{end}}
    </main>
    <footer>Site Footer</footer>
</body>
</html>
`

const pageTemplate = `
{{define "title"}}About Us{{end}}
{{define "content"}}
<h1>About Our Company</h1>
<p>We are a company that does things.</p>
{{end}}
`

// Parse both templates
tmpl, err := template.New("master").Parse(masterTemplate)
if err != nil {
    // Handle error
}

_, err = tmpl.New("page").Parse(pageTemplate)
if err != nil {
    // Handle error
}

// Execute the template
err = tmpl.ExecuteTemplate(os.Stdout, "master", nil)
if err != nil {
    // Handle error
}
```

This pattern allows you to:

1. Define a base template with "slots" (blocks)
2. Override those blocks in child templates
3. Reuse common structure across multiple pages

## html/template vs text/template

While we've been using `text/template` in examples, Go also provides `html/template`, which works identically but with one crucial difference: automatic context-aware escaping to prevent XSS attacks.

```go
import "html/template"

const templateText = `<p>Hello, {{.Name}}!</p>`

data := struct {
    Name string
}{"<script>alert('XSS')</script>"}

tmpl, err := template.New("example").Parse(templateText)
if err != nil {
    // Handle error
}

err = tmpl.Execute(os.Stdout, data)
if err != nil {
    // Handle error
}
```

With `html/template`, this outputs:

```html
<p>Hello, <script>alert('XSS')</script>!</p>
```

The malicious script is automatically escaped based on where it appears in the HTML.

## Template Caching and Reuse

In real applications, you typically:

1. Parse templates once at startup
2. Reuse the parsed templates many times
3. Execute with different data each time

```go
// At application startup
tmpl, err := template.ParseFiles("header.tmpl", "content.tmpl", "footer.tmpl")
if err != nil {
    log.Fatal(err)
}

// For each request
func handleRequest(w http.ResponseWriter, r *http.Request) {
    data := getData(r) // Get data for this request
    err := tmpl.ExecuteTemplate(w, "content.tmpl", data)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
    }
}
```

This approach is more efficient because:

* Parsing is relatively expensive
* Execution is fast
* Templates are concurrency-safe after parsing

## Common Gotchas and Best Practices

### Nil Data

```go
tmpl, _ := template.New("test").Parse("Hello, {{.Name}}!")
tmpl.Execute(os.Stdout, nil) // Will cause a runtime error
```

This fails because `.Name` can't be evaluated on `nil`. Always provide a valid data structure.

### Missing Fields

```go
tmpl, _ := template.New("test").Parse("Hello, {{.Name}}!")
data := struct{}{} // No Name field
tmpl.Execute(os.Stdout, data) // Outputs: Hello, !
```

Missing fields don't cause errors; they evaluate to the zero value (empty string in this case).

### Methods on Data

Templates can access methods on data:

```go
type Person struct {
    FirstName string
    LastName  string
}

func (p Person) FullName() string {
    return p.FirstName + " " + p.LastName
}

tmpl, _ := template.New("test").Parse("Hello, {{.FullName}}!")
person := Person{"Eve", "Smith"}
tmpl.Execute(os.Stdout, person) // Outputs: Hello, Eve Smith!
```

This is useful for encapsulating logic in your data types.

## The Complete Process: Under the Hood

Let's trace through a complete example from parsing to execution, examining what happens internally:

```go
package main

import (
    "os"
    "text/template"
)

func main() {
    // Template text
    const templateText = `
    {{- /* A comment */ -}}
    {{- if .Success -}}
        Congratulations, {{ .Name }}!
        {{ range .Items -}}
            - {{ . }}
        {{ end }}
    {{- else -}}
        Sorry, {{ .Name }}.
    {{- end -}}
    `

    // Create and parse the template
    tmpl, err := template.New("notification").Parse(templateText)
    if err != nil {
        panic(err)
    }

    // Data for execution
    data := struct {
        Success bool
        Name    string
        Items   []string
    }{
        Success: true,
        Name:    "Frank",
        Items:   []string{"Item A", "Item B", "Item C"},
    }

    // Execute the template
    err = tmpl.Execute(os.Stdout, data)
    if err != nil {
        panic(err)
    }
}
```

### Parsing Process Details

1. **Initialization** : Creates a new template named "notification"
2. **Lexical Analysis** :

* The template string is scanned character by character
* The scanner identifies tokens: text, actions, comments, etc.
* `{{- /* A comment */ -}}` is identified as a comment with trimming
* `{{- if .Success -}}` is an if-action with trimming
* And so on...

1. **Syntax Analysis** :

* Tokens are organized into a tree structure
* Root node contains all top-level nodes
* The if-statement becomes a branch with condition and two paths
* The range loop becomes another branch with an iterable and body

1. **Tree Construction** :

```
   Root
   ├── If Node (condition: .Success)
   │   ├── True Branch
   │   │   ├── Text Node ("Congratulations, ")
   │   │   ├── Action Node (.Name)
   │   │   ├── Text Node ("!\n")
   │   │   └── Range Node (iterable: .Items)
   │   │       ├── Text Node ("    - ")
   │   │       ├── Action Node (.)
   │   │       └── Text Node ("\n")
   │   └── False Branch
   │       ├── Text Node ("Sorry, ")
   │       ├── Action Node (.Name)
   │       └── Text Node (".")
```

1. **Validation** : Checks for balanced delimiters, valid expressions, etc.

### Execution Process Details

1. **Initialization** :

* Sets up the execution environment
* Prepares buffers for output
* Sets the data context to the provided struct

1. **Tree Traversal** :

* Starts at the root node
* Evaluates the if-condition: `.Success` is `true`
* Follows the true branch

1. **Action Evaluation** :

* Evaluates `.Name` to "Frank"
* Evaluates `.Items` to the slice ["Item A", "Item B", "Item C"]
* For each item in the range, sets `.` to the current item and processes the range body

1. **Output Generation** :

```
   Congratulations, Frank!
   - Item A
   - Item B
   - Item C
```

## Common Advanced Features

### Pipelines

Templates support Unix-like pipelines to chain operations:

```go
tmpl, _ := template.New("test").Funcs(template.FuncMap{
    "title": strings.Title,
}).Parse("Hello, {{.Name | title}}!")

data := struct{ Name string }{"george washington"}
tmpl.Execute(os.Stdout, data) // Outputs: Hello, George Washington!
```

The output of `.Name` is piped to the `title` function.

### Variables

You can store values in variables for later use:

```go
const templateText = `
{{$name := .Name}}
{{$greeting := "Hello"}}
{{$greeting}}, {{$name}}!
`

data := struct{ Name string }{"Grace"}
tmpl, _ := template.New("vars").Parse(templateText)
tmpl.Execute(os.Stdout, data) // Outputs: Hello, Grace!
```

Variables are prefixed with `$` and can store any value.

### Template Debugging

To debug templates, you can:

1. Use the `printf` function to inspect values
2. Print the entire data context
3. Examine parse errors carefully

```go
tmpl, _ := template.New("debug").Funcs(template.FuncMap{
    "debug": func(v interface{}) string {
        data, _ := json.MarshalIndent(v, "", "  ")
        return string(data)
    },
}).Parse(`
Data: {{debug .}}
Name: {{.Name}}
`)

data := struct{ 
    Name string 
    Age int 
}{"Hannah", 28}

tmpl.Execute(os.Stdout, data)
```

## Conclusion

Go's template system provides a powerful way to generate text output from data. By understanding the parsing and execution process, you can leverage templates effectively in your applications.

The key points to remember:

1. Templates are parsed once and can be executed many times
2. The parsing phase builds a syntax tree
3. The execution phase traverses the tree with data
4. Context (the dot) changes as the template executes
5. Functions and methods can transform data during execution
6. Templates can be nested and composed for reuse

With these fundamentals, you can build sophisticated template systems for web pages, configuration files, code generation, and more.
