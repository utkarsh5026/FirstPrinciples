# Higher-Kinded Types Simulation in TypeScript

Let's build this concept from the ground up, starting with JavaScript fundamentals and progressing to advanced type system simulation.

## JavaScript Foundation: Functions and Data Structures

In JavaScript, we work with values and functions that operate on those values:

```javascript
// Basic values
const number = 42;
const string = "hello";
const array = [1, 2, 3];

// Functions that work with specific types
function doubleNumber(x) {
    return x * 2;
}

function upperCaseString(s) {
    return s.toUpperCase();
}

function mapArray(arr, fn) {
    return arr.map(fn);
}
```

Notice how each function is tied to specific data structures. We can't easily abstract over the "shape" of the container.

## TypeScript's Type System: From Values to Types

TypeScript adds a type layer that describes the shape of JavaScript values:

```typescript
// Types describe JavaScript values
type NumberType = number;        // describes number values
type StringType = string;        // describes string values
type ArrayType<T> = T[];        // describes array values

// Functions with type signatures
function doubleNumber(x: number): number {
    return x * 2;
}

function mapArray<T, U>(arr: T[], fn: (x: T) => U): U[] {
    return arr.map(fn);
}
```

But what if we want to abstract over type constructors themselves?

## Understanding "Kinds" in Type Theory

> **Mental Model** : Just as values have types, types have "kinds"
>
> * Values: `42`, `"hello"`, `[1,2,3]`
> * Types: `number`, `string`, `number[]`
> * Kinds: `*` (concrete type), `* -> *` (type constructor)

```
Value Level:    42          "hello"         [1,2,3]
                ↑              ↑               ↑
Type Level:   number        string        number[]
                ↑              ↑               ↑
Kind Level:     *              *               *

Type Constructor Level:                    Array<T>
                                             ↑
Kind Level:                               * -> *
```

## The Problem: TypeScript's Limitation

TypeScript doesn't natively support higher-kinded types. Here's what we can't do directly:

```typescript
// ❌ This doesn't work in TypeScript
interface Functor<F<_>> {
    map<A, B>(fa: F<A>, f: (a: A) => B): F<B>;
}

// ❌ We can't abstract over Array, Promise, Option, etc.
class ArrayFunctor implements Functor<Array> { ... }
class PromiseFunctor implements Functor<Promise> { ... }
```

> **Key Problem** : TypeScript can't express "give me any type constructor that takes one type parameter"

## Simulation Technique 1: URI-Based Encoding

We simulate higher-kinded types by using string literal types as "tags":

```typescript
// Step 1: Define a URI system for type constructors
declare const HKT_URI: unique symbol;

interface HKT<URI, A> {
    readonly [HKT_URI]: URI;
    readonly _A: A;
}

// Step 2: Register specific type constructors
declare const ARRAY_URI = 'Array';
declare const PROMISE_URI = 'Promise';
declare const OPTION_URI = 'Option';

type ArrayURI = typeof ARRAY_URI;
type PromiseURI = typeof PROMISE_URI;
type OptionURI = typeof OPTION_URI;
```

Now we create a mapping from URIs to actual types:

```typescript
// Step 3: Map URIs to real types
interface URItoKind<A> {
    [ARRAY_URI]: Array<A>;
    [PROMISE_URI]: Promise<A>;
    [OPTION_URI]: Option<A>;
}

// Helper type to extract the real type
type Kind<URI extends keyof URItoKind<any>, A> = URItoKind<A>[URI];
```

Let's see this in action:

```typescript
// Step 4: Define the Functor interface using our encoding
interface Functor<URI extends keyof URItoKind<any>> {
    readonly URI: URI;
    map<A, B>(fa: Kind<URI, A>, f: (a: A) => B): Kind<URI, B>;
}

// Step 5: Implement for specific types
class ArrayFunctor implements Functor<ArrayURI> {
    readonly URI = ARRAY_URI;
  
    map<A, B>(fa: Array<A>, f: (a: A) => B): Array<B> {
        return fa.map(f);
    }
}

class PromiseFunctor implements Functor<PromiseURI> {
    readonly URI = PROMISE_URI;
  
    map<A, B>(fa: Promise<A>, f: (a: A) => B): Promise<B> {
        return fa.then(f);
    }
}
```

## Building a Complete Example: Option Type

Let's implement a complete higher-kinded type simulation with an Option type:

```typescript
// Option type definition
abstract class Option<A> {
    abstract map<B>(f: (a: A) => B): Option<B>;
    abstract flatMap<B>(f: (a: A) => Option<B>): Option<B>;
    abstract isSome(): boolean;
    abstract isNone(): boolean;
}

class Some<A> extends Option<A> {
    constructor(public readonly value: A) {
        super();
    }
  
    map<B>(f: (a: A) => B): Option<B> {
        return new Some(f(this.value));
    }
  
    flatMap<B>(f: (a: A) => Option<B>): Option<B> {
        return f(this.value);
    }
  
    isSome(): boolean { return true; }
    isNone(): boolean { return false; }
}

class None extends Option<never> {
    map<B>(_f: (a: never) => B): Option<B> {
        return new None();
    }
  
    flatMap<B>(_f: (a: never) => Option<B>): Option<B> {
        return new None();
    }
  
    isSome(): boolean { return false; }
    isNone(): boolean { return true; }
}

// Register Option in our HKT system
interface URItoKind<A> {
    [ARRAY_URI]: Array<A>;
    [PROMISE_URI]: Promise<A>;
    [OPTION_URI]: Option<A>;  // Added Option
}

// Implement Functor for Option
class OptionFunctor implements Functor<OptionURI> {
    readonly URI = OPTION_URI;
  
    map<A, B>(fa: Option<A>, f: (a: A) => B): Option<B> {
        return fa.map(f);
    }
}
```

## Advanced Pattern: Monad Simulation

We can extend this pattern to simulate Monads:

```typescript
// Monad interface extends Functor
interface Monad<URI extends keyof URItoKind<any>> extends Functor<URI> {
    // 'return' or 'pure' - lift a value into the context
    of<A>(a: A): Kind<URI, A>;
  
    // 'flatMap' or 'bind' - sequentially compose operations
    flatMap<A, B>(
        ma: Kind<URI, A>, 
        f: (a: A) => Kind<URI, B>
    ): Kind<URI, B>;
}

// Array Monad implementation
class ArrayMonad implements Monad<ArrayURI> {
    readonly URI = ARRAY_URI;
  
    // Functor requirement
    map<A, B>(fa: Array<A>, f: (a: A) => B): Array<B> {
        return fa.map(f);
    }
  
    // Monad-specific methods
    of<A>(a: A): Array<A> {
        return [a];
    }
  
    flatMap<A, B>(ma: Array<A>, f: (a: A) => Array<B>): Array<B> {
        return ma.flatMap(f);
    }
}

// Option Monad implementation
class OptionMonad implements Monad<OptionURI> {
    readonly URI = OPTION_URI;
  
    map<A, B>(fa: Option<A>, f: (a: A) => B): Option<B> {
        return fa.map(f);
    }
  
    of<A>(a: A): Option<A> {
        return new Some(a);
    }
  
    flatMap<A, B>(ma: Option<A>, f: (a: A) => Option<B>): Option<B> {
        return ma.flatMap(f);
    }
}
```

## Generic Functions Using HKT Simulation

Now we can write truly generic functions:

```typescript
// Generic function that works with any Functor
function lift2<URI extends keyof URItoKind<any>, A, B, C>(
    F: Functor<URI>,
    fa: Kind<URI, A>,
    fb: Kind<URI, B>,
    f: (a: A, b: B) => C
): Kind<URI, C> {
    // This only works if we have Applicative, but demonstrates the concept
    return F.map(fa, (a) => (b: B) => f(a, b)) as any; // Simplified
}

// Generic function that works with any Monad
function sequence<URI extends keyof URItoKind<any>, A>(
    M: Monad<URI>,
    mas: Array<Kind<URI, A>>
): Kind<URI, Array<A>> {
    return mas.reduce(
        (acc, ma) => M.flatMap(acc, (as) => 
            M.map(ma, (a) => [...as, a])
        ),
        M.of([] as A[])
    );
}

// Usage examples
const arrayMonad = new ArrayMonad();
const optionMonad = new OptionMonad();

// Works with arrays
const arrayResult = sequence(arrayMonad, [[1, 2], [3, 4]]);
// Result: [1, 3], [1, 4], [2, 3], [2, 4] (cartesian product)

// Works with options
const optionResult = sequence(optionMonad, [
    new Some(1), 
    new Some(2), 
    new None()
]);
// Result: None (because one element is None)
```

## Simulation Technique 2: Branded Types

An alternative approach uses branded types:

```typescript
// Brand for higher-kinded types
declare const HKT_BRAND: unique symbol;

type HKT<F, A> = {
    readonly [HKT_BRAND]: F;
    readonly _A: A;
} & F;

// Type-level functions to work with HKT
type Apply<F, A> = F extends HKT<infer FF, any> 
    ? FF extends (...args: any[]) => any
        ? ReturnType<FF>
        : never
    : never;

// Example usage with this approach
type ArrayHKT = HKT<(a: any) => any[], any>;
type PromiseHKT = HKT<(a: any) => Promise<any>, any>;

interface Functor2<F> {
    map<A, B>(fa: Apply<F, A>, f: (a: A) => B): Apply<F, B>;
}
```

## Real-World Application: fp-ts Library

The most mature implementation of this pattern is in the fp-ts library:

```typescript
// Simplified version of fp-ts approach
import { HKT, Kind, URIS } from 'fp-ts/HKT';

// fp-ts uses this pattern extensively
declare module 'fp-ts/HKT' {
    interface URItoKind<A> {
        readonly Array: Array<A>;
        readonly Option: Option<A>;
        readonly Either: Either<any, A>;
        readonly IO: IO<A>;
        readonly Task: Task<A>;
    }
}

// Generic traverse function from fp-ts
declare function traverse<F extends URIS, G extends URIS>(
    F: Applicative1<F>,
    G: Traversable1<G>
): <A, B>(ta: Kind<G, A>, f: (a: A) => Kind<F, B>) => Kind<F, Kind<G, B>>;
```

## Common Gotchas and Limitations

> **Compile-time vs Runtime** : The HKT simulation exists only at the type level. At runtime, you're still working with regular JavaScript objects.

```typescript
// ❌ This won't work at runtime
function getURI<F>(hkt: HKT<F, any>): F {
    return hkt[HKT_URI]; // Runtime error: property doesn't exist
}

// ✅ This works because we use runtime properties
function getURI<URI extends keyof URItoKind<any>>(
    instance: Functor<URI>
): URI {
    return instance.URI; // Works: URI is a real runtime property
}
```

> **Type Complexity** : Heavy use of HKT simulation can lead to complex error messages and slower compilation.

> **Limited Inference** : TypeScript's type inference doesn't work as well with simulated HKTs compared to native higher-kinded types in languages like Haskell.

## Why This Matters

Higher-kinded type simulation enables:

1. **True Abstraction** : Write functions that work across different container types
2. **Code Reuse** : Implement patterns like Functor, Applicative, Monad once
3. **Type Safety** : Maintain full type checking while being generic
4. **Functional Programming** : Enable advanced FP patterns in TypeScript

> **Mental Model** : Think of HKT simulation as creating a "type-level plugin system" where you can register new container types and automatically get implementations of common patterns.

This simulation technique bridges the gap between TypeScript's current capabilities and the expressive power found in languages with native higher-kinded types, enabling sophisticated functional programming patterns while maintaining type safety.
