# Parser Combinators: Building Type-Safe Parsers with TypeScript

Let me guide you through parser combinators from the ground up, starting with JavaScript fundamentals and building toward advanced type-safe implementations.

## 1. JavaScript Foundation: What is Parsing?

**JavaScript Concept First:** Parsing is the process of analyzing a string and extracting structured data from it.

```javascript
// Basic string parsing in JavaScript
function parseNumber(input) {
    const match = input.match(/^\d+/);
    if (match) {
        return {
            success: true,
            value: parseInt(match[0]),
            remaining: input.slice(match[0].length)
        };
    }
    return { success: false };
}

// Usage
console.log(parseNumber("123abc")); // { success: true, value: 123, remaining: "abc" }
console.log(parseNumber("abc123")); // { success: false }
```

**The Core Problem:** Manual string parsing becomes complex quickly. We need a systematic way to build parsers.

## 2. The Parser Concept

A parser is a function that takes an input string and returns either:

* Success: the parsed value + remaining input
* Failure: information about why parsing failed

```javascript
// JavaScript: Basic parser type
function createParser(parserFunction) {
    return parserFunction;
}

// A parser that matches a specific character
function char(expectedChar) {
    return function(input) {
        if (input[0] === expectedChar) {
            return {
                success: true,
                value: expectedChar,
                remaining: input.slice(1)
            };
        }
        return {
            success: false,
            error: `Expected '${expectedChar}', got '${input[0] || 'EOF'}'`
        };
    };
}

// Usage
const parseA = char('a');
console.log(parseA("abc")); // { success: true, value: 'a', remaining: 'bc' }
console.log(parseA("xyz")); // { success: false, error: "Expected 'a', got 'x'" }
```

## 3. What Are Combinators?

**Combinators** are higher-order functions that take parsers as input and return new parsers. They allow us to build complex parsers from simple ones.

```javascript
// JavaScript: Basic combinator - sequence
function sequence(parser1, parser2) {
    return function(input) {
        const result1 = parser1(input);
        if (!result1.success) return result1;
      
        const result2 = parser2(result1.remaining);
        if (!result2.success) return result2;
      
        return {
            success: true,
            value: [result1.value, result2.value],
            remaining: result2.remaining
        };
    };
}

// Usage: Parse "ab"
const parseAB = sequence(char('a'), char('b'));
console.log(parseAB("abc")); // { success: true, value: ['a', 'b'], remaining: 'c' }
```

> **Key Mental Model:** Combinators let us compose small, simple parsers into larger, more complex ones. Think of them as "parser algebra."

## 4. TypeScript Enhancement: Adding Type Safety

**Now let's add TypeScript types to make this type-safe:**

```typescript
// TypeScript: Define the core types
type ParseResult<T> = 
    | { success: true; value: T; remaining: string }
    | { success: false; error: string };

type Parser<T> = (input: string) => ParseResult<T>;

// Type-safe character parser
function char(expectedChar: string): Parser<string> {
    return (input: string): ParseResult<string> => {
        if (input[0] === expectedChar) {
            return {
                success: true,
                value: expectedChar,
                remaining: input.slice(1)
            };
        }
        return {
            success: false,
            error: `Expected '${expectedChar}', got '${input[0] || 'EOF'}'`
        };
    };
}
```

> **TypeScript Benefit:** Now the compiler knows that `char('a')` returns a `Parser<string>`, and we get full type checking on our parser compositions.

## 5. Building Advanced Type-Safe Combinators

Let's create more sophisticated combinators with precise types:

```typescript
// Sequence combinator with precise typing
function sequence<A, B>(
    parser1: Parser<A>, 
    parser2: Parser<B>
): Parser<[A, B]> {
    return (input: string): ParseResult<[A, B]> => {
        const result1 = parser1(input);
        if (!result1.success) return result1;
      
        const result2 = parser2(result1.remaining);
        if (!result2.success) return result2;
      
        return {
            success: true,
            value: [result1.value, result2.value],
            remaining: result2.remaining
        };
    };
}

// Choice combinator (try first parser, then second if first fails)
function choice<A>(parser1: Parser<A>, parser2: Parser<A>): Parser<A> {
    return (input: string): ParseResult<A> => {
        const result1 = parser1(input);
        if (result1.success) return result1;
      
        return parser2(input);
    };
}

// Map combinator (transform the result)
function map<A, B>(parser: Parser<A>, transform: (value: A) => B): Parser<B> {
    return (input: string): ParseResult<B> => {
        const result = parser(input);
        if (!result.success) return result;
      
        return {
            success: true,
            value: transform(result.value),
            remaining: result.remaining
        };
    };
}
```

## 6. Advanced Type System Features

Now let's leverage TypeScript's advanced type system for even more powerful combinators:

```typescript
// Variable-length sequence using recursive types
type ParseResults<T extends readonly unknown[]> = {
    [K in keyof T]: T[K] extends Parser<infer U> ? U : never;
};

function sequenceAll<T extends readonly Parser<any>[]>(
    ...parsers: T
): Parser<ParseResults<T>> {
    return (input: string) => {
        const results: any[] = [];
        let remaining = input;
      
        for (const parser of parsers) {
            const result = parser(remaining);
            if (!result.success) return result;
            results.push(result.value);
            remaining = result.remaining;
        }
      
        return {
            success: true,
            value: results as ParseResults<T>,
            remaining
        };
    };
}

// Usage with full type inference
const parseThreeChars = sequenceAll(char('a'), char('b'), char('c'));
// Type is Parser<[string, string, string]>

const result = parseThreeChars("abcd");
if (result.success) {
    // result.value is typed as [string, string, string]
    console.log(result.value); // ['a', 'b', 'c']
}
```

## 7. Conditional Types for Advanced Parsing

Let's create a combinator that uses conditional types to handle optional parsing:

```typescript
// Optional combinator using conditional types
type OptionalResult<T> = T | null;

function optional<T>(parser: Parser<T>): Parser<OptionalResult<T>> {
    return (input: string): ParseResult<OptionalResult<T>> => {
        const result = parser(input);
        if (result.success) {
            return result;
        }
      
        return {
            success: true,
            value: null,
            remaining: input
        };
    };
}

// Many combinator (zero or more)
function many<T>(parser: Parser<T>): Parser<T[]> {
    return (input: string): ParseResult<T[]> => {
        const results: T[] = [];
        let remaining = input;
      
        while (true) {
            const result = parser(remaining);
            if (!result.success) break;
            results.push(result.value);
            remaining = result.remaining;
        }
      
        return {
            success: true,
            value: results,
            remaining
        };
    };
}
```

## 8. Real-World Example: JSON Parser

Let's build a type-safe JSON parser using our combinators:

```typescript
// Utility parsers
function regex(pattern: RegExp): Parser<string> {
    return (input: string): ParseResult<string> => {
        const match = input.match(pattern);
        if (match && match.index === 0) {
            return {
                success: true,
                value: match[0],
                remaining: input.slice(match[0].length)
            };
        }
        return {
            success: false,
            error: `Pattern ${pattern} not matched`
        };
    };
}

function whitespace(): Parser<null> {
    return map(regex(/^\s*/), () => null);
}

// JSON value types
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

// String parser
const jsonString: Parser<string> = map(
    regex(/^"([^"\\]|\\.)*"/),
    (match) => JSON.parse(match) // Leverage built-in JSON string parsing
);

// Number parser
const jsonNumber: Parser<number> = map(
    regex(/^-?\d+(\.\d+)?([eE][+-]?\d+)?/),
    (match) => parseFloat(match)
);

// Boolean and null parsers
const jsonTrue: Parser<boolean> = map(regex(/^true/), () => true);
const jsonFalse: Parser<boolean> = map(regex(/^false/), () => false);
const jsonNull: Parser<null> = map(regex(/^null/), () => null);

// Forward declaration for recursive types
const jsonValue: Parser<JsonValue> = (input: string) => {
    return choice(
        choice(jsonString, jsonNumber),
        choice(choice(jsonTrue, jsonFalse), jsonNull)
        // We'd add array and object parsers here
    )(input);
};
```

## 9. Advanced Type-Level Programming

Here's where TypeScript's type system really shines - we can encode parsing rules at the type level:

```typescript
// Template literal type parsing
type ParseDigit<S extends string> = 
    S extends `${infer D}${infer Rest}` 
        ? D extends '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
            ? { digit: D; remaining: Rest }
            : never
        : never;

type ParseNumber<S extends string, Acc extends string = ""> =
    S extends ""
        ? Acc extends "" ? never : { value: Acc; remaining: S }
        : ParseDigit<S> extends { digit: infer D; remaining: infer Rest }
            ? D extends string
                ? Rest extends string
                    ? ParseNumber<Rest, `${Acc}${D}`>
                    : never
                : never
            : Acc extends "" ? never : { value: Acc; remaining: S };

// Usage at type level
type Test1 = ParseNumber<"123abc">; // { value: "123"; remaining: "abc" }
type Test2 = ParseNumber<"abc">; // never
```

> **Type-Level Parsing:** We can actually parse strings at the TypeScript type level! This enables compile-time validation of string literals.

## 10. Complete Type-Safe Parser Framework

```typescript
// Type-Safe Parser Combinator Framework
// A complete implementation showing TypeScript's type system in action

// Core Types
type ParseResult<T> = 
    | { success: true; value: T; remaining: string }
    | { success: false; error: string; position: number };

type Parser<T> = (input: string, position?: number) => ParseResult<T>;

// Utility type for extracting parser result types
type ExtractParserType<P> = P extends Parser<infer T> ? T : never;

// Basic Parsers
export function char(expectedChar: string): Parser<string> {
    return (input: string, position = 0): ParseResult<string> => {
        if (position >= input.length) {
            return { success: false, error: `Expected '${expectedChar}', got EOF`, position };
        }
        
        if (input[position] === expectedChar) {
            return {
                success: true,
                value: expectedChar,
                remaining: input.slice(position + 1)
            };
        }
        
        return {
            success: false,
            error: `Expected '${expectedChar}', got '${input[position]}'`,
            position
        };
    };
}

export function regex(pattern: RegExp, name?: string): Parser<string> {
    return (input: string, position = 0): ParseResult<string> => {
        const remaining = input.slice(position);
        const match = remaining.match(pattern);
        
        if (match && match.index === 0) {
            return {
                success: true,
                value: match[0],
                remaining: input.slice(position + match[0].length)
            };
        }
        
        return {
            success: false,
            error: `Expected ${name || pattern.toString()}, got '${remaining.slice(0, 10)}...'`,
            position
        };
    };
}

export function string(expectedString: string): Parser<string> {
    return (input: string, position = 0): ParseResult<string> => {
        const remaining = input.slice(position);
        if (remaining.startsWith(expectedString)) {
            return {
                success: true,
                value: expectedString,
                remaining: input.slice(position + expectedString.length)
            };
        }
        
        return {
            success: false,
            error: `Expected '${expectedString}', got '${remaining.slice(0, expectedString.length)}'`,
            position
        };
    };
}

// Combinator: Sequence with tuple type inference
export function sequence<T extends readonly Parser<any>[]>(
    ...parsers: T
): Parser<{ [K in keyof T]: ExtractParserType<T[K]> }> {
    return (input: string, position = 0) => {
        const results: any[] = [];
        let currentInput = input;
        let currentPosition = position;
        
        for (const parser of parsers) {
            const result = parser(currentInput, 0);
            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    position: currentPosition + (input.length - currentInput.length)
                };
            }
            results.push(result.value);
            currentInput = result.remaining;
        }
        
        return {
            success: true,
            value: results as { [K in keyof T]: ExtractParserType<T[K]> },
            remaining: currentInput
        };
    };
}

// Combinator: Choice
export function choice<T>(...parsers: Parser<T>[]): Parser<T> {
    return (input: string, position = 0): ParseResult<T> => {
        const errors: string[] = [];
        
        for (const parser of parsers) {
            const result = parser(input, position);
            if (result.success) return result;
            errors.push(result.error);
        }
        
        return {
            success: false,
            error: `None of the choices matched: ${errors.join(', ')}`,
            position
        };
    };
}

// Combinator: Map (transform result)
export function map<A, B>(parser: Parser<A>, transform: (value: A) => B): Parser<B> {
    return (input: string, position = 0): ParseResult<B> => {
        const result = parser(input, position);
        if (!result.success) return result;
        
        return {
            success: true,
            value: transform(result.value),
            remaining: result.remaining
        };
    };
}

// Combinator: Optional
export function optional<T>(parser: Parser<T>): Parser<T | null> {
    return (input: string, position = 0): ParseResult<T | null> => {
        const result = parser(input, position);
        if (result.success) return result;
        
        return {
            success: true,
            value: null,
            remaining: input.slice(position)
        };
    };
}

// Combinator: Many (zero or more)
export function many<T>(parser: Parser<T>): Parser<T[]> {
    return (input: string, position = 0): ParseResult<T[]> => {
        const results: T[] = [];
        let currentInput = input.slice(position);
        
        while (true) {
            const result = parser(currentInput, 0);
            if (!result.success) break;
            results.push(result.value);
            currentInput = result.remaining;
        }
        
        return {
            success: true,
            value: results,
            remaining: currentInput
        };
    };
}

// Combinator: Many1 (one or more)
export function many1<T>(parser: Parser<T>): Parser<T[]> {
    return map(
        sequence(parser, many(parser)),
        ([first, rest]) => [first, ...rest]
    );
}

// Combinator: Between (parse something between delimiters)
export function between<T, L, R>(
    left: Parser<L>,
    parser: Parser<T>,
    right: Parser<R>
): Parser<T> {
    return map(
        sequence(left, parser, right),
        ([, value]) => value
    );
}

// Combinator: Separated by
export function sepBy<T, S>(
    parser: Parser<T>,
    separator: Parser<S>
): Parser<T[]> {
    return choice(
        map(
            sequence(parser, many(map(sequence(separator, parser), ([, p]) => p))),
            ([first, rest]) => [first, ...rest]
        ),
        map(regex(/^/), () => []) // Empty array for no matches
    );
}

// Advanced: Recursive parser support
export function lazy<T>(parserFactory: () => Parser<T>): Parser<T> {
    let parser: Parser<T> | null = null;
    
    return (input: string, position = 0): ParseResult<T> => {
        if (!parser) parser = parserFactory();
        return parser(input, position);
    };
}

// JSON Parser Example using the framework
type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };

// Whitespace
const ws = regex(/^\s*/, 'whitespace');

// JSON String
const jsonString: Parser<string> = map(
    regex(/^"([^"\\]|\\.)*"/, 'string'),
    (match) => JSON.parse(match)
);

// JSON Number
const jsonNumber: Parser<number> = map(
    regex(/^-?\d+(\.\d+)?([eE][+-]?\d+)?/, 'number'),
    (match) => parseFloat(match)
);

// JSON Literals
const jsonTrue: Parser<boolean> = map(string('true'), () => true);
const jsonFalse: Parser<boolean> = map(string('false'), () => false);
const jsonNull: Parser<null> = map(string('null'), () => null);

// JSON Array (recursive)
const jsonArray: Parser<JsonValue[]> = lazy(() =>
    between(
        sequence(char('['), ws),
        sepBy(
            map(sequence(ws, jsonValue, ws), ([, value]) => value),
            char(',')
        ),
        sequence(ws, char(']'))
    )
);

// JSON Object (recursive)
const jsonObject: Parser<JsonObject> = lazy(() =>
    map(
        between(
            sequence(char('{'), ws),
            sepBy(
                map(
                    sequence(
                        ws, jsonString, ws, char(':'), ws, jsonValue, ws
                    ),
                    ([, key, , , , value]) => [key, value] as [string, JsonValue]
                ),
                char(',')
            ),
            sequence(ws, char('}'))
        ),
        (pairs) => Object.fromEntries(pairs)
    )
);

// JSON Value (union of all types)
const jsonValue: Parser<JsonValue> = choice(
    jsonString,
    jsonNumber,
    jsonTrue,
    jsonFalse,
    jsonNull,
    jsonArray,
    jsonObject
);

// Main JSON parser
export const parseJson = map(
    sequence(ws, jsonValue, ws),
    ([, value]) => value
);

// Example usage:
// const result = parseJson('{"name": "John", "age": 30, "active": true}');
// if (result.success) {
//     console.log(result.value); // Fully typed JSON object
// }
```

Here's a comprehensive parser combinator library:## Key Benefits of This Type-Safe Approach

> **Compile-Time Safety:** TypeScript catches type errors in parser compositions before runtime, preventing many common parsing bugs.

```typescript
// This would cause a TypeScript error:
const badParser = sequence(char('a'), char('b'), char('c'));
// Trying to access result.value[3] would be caught at compile time!

// This is fully type-safe:
const goodParser = sequence(char('a'), regex(/^\d+/), char('!'));
// result.value is typed as [string, string, string]
```

## ASCII Diagram: Parser Combinator Flow

```
Input String: "123,456,789"
     │
     ▼
┌─────────────────┐
│   sepBy Parser  │
│  (number, ',')  │
└─────────────────┘
     │
     ▼
┌─────────────────┐    ┌─────────────────┐
│  First Number   │───▶│   Many of:      │
│    Parser       │    │ (comma + number)│
│   "123" ✓       │    └─────────────────┘
└─────────────────┘           │
                              ▼
                    ┌─────────────────┐
                    │   ",456" ✓      │
                    │   ",789" ✓      │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Final Result:   │
                    │ [123, 456, 789] │
                    │ Type: number[]  │
                    └─────────────────┘
```

## Common Gotchas and Best Practices

> **Runtime vs Compile Time:** Remember that types exist only at compile time. The actual parsing happens at runtime with the same JavaScript logic.

```typescript
// ❌ This won't work - types don't exist at runtime
function badParser<T extends string>(expectedString: T): Parser<T> {
    return (input) => {
        // T is not available here!
        if (input.startsWith(T)) { // Error: T is not defined
            // ...
        }
    };
}

// ✅ This works - use the actual value
function goodParser<T extends string>(expectedString: T): Parser<T> {
    return (input) => {
        if (input.startsWith(expectedString)) {
            return {
                success: true,
                value: expectedString, // This is the actual runtime value
                remaining: input.slice(expectedString.length)
            };
        }
        // ...
    };
}
```

> **Performance Consideration:** Parser combinators create many function calls. For high-performance parsing, consider generating optimized parsers from combinator descriptions.

## Advanced Pattern: Type-Level Validation

Here's how we can validate parser structure at the type level:

```typescript
// Type-level validation of parser sequences
type ValidSequence<T extends readonly any[]> = 
    T extends readonly [Parser<any>, ...infer Rest]
        ? Rest extends readonly Parser<any>[]
            ? true
            : false
        : T extends readonly []
            ? true
            : false;

// This ensures only valid parser sequences compile
function safeSequence<T extends readonly Parser<any>[]>(
    ...parsers: ValidSequence<T> extends true ? T : never
): Parser<{ [K in keyof T]: ExtractParserType<T[K]> }> {
    return sequence(...parsers);
}

// Usage - this compiles:
const validParser = safeSequence(char('a'), regex(/^\d+/));

// This would cause a compile error:
// const invalidParser = safeSequence(char('a'), "not a parser");
```

## Real-World Usage Example

Here's how you'd use this framework in practice:

```typescript
// Define a custom language parser
const identifier = regex(/^[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier');
const number = map(regex(/^\d+/, 'number'), parseInt);
const whitespace = regex(/^\s+/, 'whitespace');

// Parse variable assignment: "x = 42"
const assignment = map(
    sequence(
        identifier,
        optional(whitespace),
        char('='),
        optional(whitespace),
        number
    ),
    ([variable, , , , value]) => ({ variable, value })
);

// Usage
const result = assignment("x = 42");
if (result.success) {
    // result.value is typed as { variable: string; value: number }
    console.log(`Variable ${result.value.variable} = ${result.value.value}`);
}
```

> **Key Insight:** Parser combinators with TypeScript's type system give us both the flexibility of composable parsing and the safety of static typing. This combination is particularly powerful for building domain-specific languages, configuration parsers, and data transformation pipelines.

The type system ensures that:

* Parser compositions are valid at compile time
* Result types are automatically inferred
* Runtime errors are caught early in development
* Refactoring is safe and guided by the compiler

This approach scales from simple string parsing to complex language implementations, all while maintaining type safety throughout the entire parsing pipeline.
