# Abstract Classes and Interface Combination: Balancing Implementation with Contracts

## JavaScript Foundation: Classes and the Implementation Problem

Before diving into TypeScript's abstract classes and interfaces, let's understand the JavaScript foundation and the problems we're trying to solve.

```javascript
// JavaScript: Basic class inheritance
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  // Every animal makes a sound, but what sound?
  makeSound() {
    throw new Error("Must implement makeSound method");
  }
  
  // Common behavior all animals share
  sleep() {
    console.log(`${this.name} is sleeping`);
  }
}

class Dog extends Animal {
  makeSound() {
    console.log(`${this.name} barks: Woof!`);
  }
}

// Problem: Nothing prevents this...
const animal = new Animal("Generic"); // This shouldn't be allowed!
// animal.makeSound(); // Runtime error!
```

 **The Core Problem** : JavaScript classes can't enforce that:

1. Some methods MUST be implemented by subclasses
2. Some classes should NEVER be instantiated directly
3. Multiple classes should follow the same "contract"

## TypeScript's Solution: The Type System Approach

TypeScript gives us two powerful tools to solve these problems:

```
Contracts & Implementation Strategy
┌─────────────────────────────────┐
│          INTERFACES             │
│    (Pure Contracts)             │
│  • Define what must exist       │
│  • No implementation           │
│  • Multiple inheritance        │
└─────────────────────────────────┘
              │
              │ Combined with
              ▼
┌─────────────────────────────────┐
│       ABSTRACT CLASSES          │
│   (Partial Implementation)      │
│  • Some concrete methods        │
│  • Some abstract methods        │
│  • Cannot be instantiated       │
└─────────────────────────────────┘
```

## Building Block 1: Interfaces as Pure Contracts

```typescript
// Interface: Pure contract definition
interface Flyable {
  // Contract: any flyable thing must have these
  maxAltitude: number;
  fly(): void;
  land(): void;
}

interface Swimmable {
  // Contract: any swimmable thing must have these
  maxDepth: number;
  swim(): void;
  dive(): void;
}

// Interfaces can extend other interfaces
interface AquaticBird extends Flyable, Swimmable {
  // Additional contract requirements
  waterproofFeathers: boolean;
}
```

> **Key Insight** : Interfaces are compile-time contracts that completely disappear at runtime. They exist only to ensure your code follows the agreed-upon structure.

## Building Block 2: Abstract Classes as Partial Implementation

```typescript
// Abstract class: Mix of implementation and contracts
abstract class Animal {
  protected name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  // Concrete implementation: all animals can do this
  sleep(): void {
    console.log(`${this.name} is sleeping`);
  }
  
  // Abstract method: forces subclasses to implement
  abstract makeSound(): void;
  
  // Abstract property: forces subclasses to define
  abstract readonly species: string;
}

// This would cause a compile error:
// const animal = new Animal("test"); // ❌ Cannot instantiate abstract class
```

> **Abstract Class Rule** : You cannot instantiate an abstract class directly. It exists only to be extended by concrete classes that implement all abstract members.

## The Power of Combination: Abstract Classes Implementing Interfaces

Here's where TypeScript shines - combining interfaces and abstract classes:

```typescript
// Step 1: Define contracts with interfaces
interface Flyable {
  maxAltitude: number;
  fly(): void;
  land(): void;
}

interface Vocal {
  makeSound(): void;
  communicateWith(other: Vocal): void;
}

// Step 2: Abstract class implements some interfaces, provides partial implementation
abstract class Bird implements Flyable, Vocal {
  protected name: string;
  public maxAltitude: number;
  
  constructor(name: string, maxAltitude: number) {
    this.name = name;
    this.maxAltitude = maxAltitude;
  }
  
  // Concrete implementation: all birds fly similarly
  fly(): void {
    console.log(`${this.name} is flying up to ${this.maxAltitude} feet`);
  }
  
  // Concrete implementation: all birds land similarly  
  land(): void {
    console.log(`${this.name} is landing`);
  }
  
  // Concrete implementation: basic communication
  communicateWith(other: Vocal): void {
    console.log(`${this.name} is communicating`);
    other.makeSound();
  }
  
  // Abstract: each bird type sounds different
  abstract makeSound(): void;
  
  // Abstract: each bird has different characteristics
  abstract readonly canSwim: boolean;
}
```

## Concrete Implementation: Bringing It All Together

```typescript
// Concrete class: implements all abstract members
class Eagle extends Bird {
  readonly canSwim = false;
  
  constructor(name: string) {
    super(name, 15000); // Eagles fly very high
  }
  
  makeSound(): void {
    console.log(`${this.name} screeches: Screech!`);
  }
  
  // Can add eagle-specific methods
  hunt(): void {
    console.log(`${this.name} is hunting with keen eyesight`);
  }
}

class Duck extends Bird implements Swimmable {
  readonly canSwim = true;
  public maxDepth = 10; // feet underwater
  
  constructor(name: string) {
    super(name, 1000); // Ducks don't fly as high
  }
  
  makeSound(): void {
    console.log(`${this.name} quacks: Quack quack!`);
  }
  
  // Implementing Swimmable interface
  swim(): void {
    console.log(`${this.name} is swimming on the surface`);
  }
  
  dive(): void {
    console.log(`${this.name} is diving up to ${this.maxDepth} feet`);
  }
}
```

## Advanced Pattern: Multiple Interface Implementation

```typescript
// Complex scenario: class that implements multiple contracts
interface Predator {
  hunt(prey: Animal): void;
  readonly huntingSuccess: number;
}

interface Pack {
  packSize: number;
  howl(): void;
  coordinateHunt(): void;
}

abstract class Mammal implements Vocal {
  protected name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  // Default communication for mammals
  communicateWith(other: Vocal): void {
    console.log(`${this.name} acknowledges ${other}`);
  }
  
  abstract makeSound(): void;
  abstract readonly furColor: string;
}

class Wolf extends Mammal implements Predator, Pack {
  readonly furColor = "gray";
  readonly huntingSuccess = 0.85;
  public packSize: number;
  
  constructor(name: string, packSize: number) {
    super(name);
    this.packSize = packSize;
  }
  
  makeSound(): void {
    console.log(`${this.name} howls: Awooooo!`);
  }
  
  // Predator implementation
  hunt(prey: Animal): void {
    console.log(`${this.name} is hunting ${prey.name}`);
  }
  
  // Pack implementation
  howl(): void {
    this.makeSound();
  }
  
  coordinateHunt(): void {
    console.log(`Pack of ${this.packSize} wolves coordinating hunt`);
  }
}
```

## The Type System in Action

```typescript
// Demonstration of type safety and flexibility
function testAnimalBehaviors() {
  const eagle = new Eagle("Baldy");
  const duck = new Duck("Donald");
  const wolf = new Wolf("Alpha", 6);
  
  // All are Vocal - can communicate
  const vocals: Vocal[] = [eagle, duck, wolf];
  vocals.forEach(animal => animal.makeSound());
  
  // Type-safe interface usage
  const flyingAnimals: Flyable[] = [eagle, duck];
  flyingAnimals.forEach(flyer => flyer.fly());
  
  // Only duck can swim (implements Swimmable)
  if ('swim' in duck) {
    duck.swim(); // TypeScript knows duck is Swimmable
  }
  
  // Wolf-specific pack behavior
  if (wolf instanceof Wolf) {
    wolf.coordinateHunt(); // TypeScript knows about Wolf methods
  }
}
```

> **Type Safety Benefit** : The compiler prevents you from calling methods that don't exist, ensures all contracts are fulfilled, and provides excellent IntelliSense support.

## Design Decision Framework

```
When to Use What?
┌─────────────────────────────────┐
│         USE INTERFACE           │
│  • Pure contracts only          │
│  • Multiple inheritance needed  │
│  • No shared implementation     │
│  • External library contracts   │
└─────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│      USE ABSTRACT CLASS         │
│  • Shared implementation +      │
│    some abstract requirements   │
│  • Common constructor logic     │
│  • Protected members needed     │
└─────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│    USE BOTH IN COMBINATION      │
│  • Complex inheritance trees    │
│  • Multiple behavior contracts  │
│  • Framework/library design     │
└─────────────────────────────────┘
```

## Common Gotchas and Best Practices

> **Gotcha 1** : Abstract classes can implement interfaces partially. Any unimplemented interface methods automatically become abstract.

```typescript
interface ComplexInterface {
  method1(): void;
  method2(): void;
  method3(): void;
}

abstract class PartialImplementation implements ComplexInterface {
  // Implement some methods
  method1(): void {
    console.log("Implemented in abstract class");
  }
  
  // method2 and method3 are automatically abstract!
  // Subclasses MUST implement them
}
```

> **Best Practice** : Use composition over deep inheritance when possible. Prefer implementing multiple interfaces over extending multiple abstract classes.

```typescript
// Better: Composition with interfaces
class ModernDuck implements Flyable, Swimmable, Vocal {
  private flightBehavior: FlightBehavior;
  private swimBehavior: SwimBehavior;
  
  constructor() {
    this.flightBehavior = new StandardFlight();
    this.swimBehavior = new SurfaceSwim();
  }
  
  // Delegate to composed behaviors
  fly(): void {
    this.flightBehavior.fly();
  }
}
```

This approach gives you the flexibility of interfaces (multiple contracts) with the reusability of abstract classes (shared implementation), while maintaining TypeScript's compile-time guarantees about your code structure.
