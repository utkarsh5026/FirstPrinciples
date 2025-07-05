# Type-Level State Machines: Modeling Stateful Systems in the Type System

Let me walk you through one of TypeScript's most powerful advanced patterns - encoding entire state machines into the type system itself. We'll build this up from JavaScript fundamentals to show you how TypeScript can prevent invalid state transitions at compile time.

## JavaScript Foundation: Runtime State Machines

First, let's understand what we're trying to improve. Here's a typical JavaScript state machine for a simple loading process:

```javascript
// JavaScript: Runtime state machine (error-prone)
class LoadingStateMachine {
  constructor() {
    this.state = 'idle';
    this.data = null;
    this.error = null;
  }
  
  startLoading() {
    // BUG: What if we're already loading?
    this.state = 'loading';
    this.data = null;
    this.error = null;
  }
  
  succeed(data) {
    // BUG: What if we call this while idle?
    this.state = 'success';
    this.data = data;
    this.error = null;
  }
  
  fail(error) {
    this.state = 'error';
    this.data = null;
    this.error = error;
  }
}

// Problems with this approach:
const machine = new LoadingStateMachine();
machine.succeed("data"); // BUG: succeeding without loading first!
machine.startLoading(); // BUG: can start loading while in error state
```

**Problems with runtime-only state machines:**

* Invalid transitions are only caught at runtime
* State and data can become inconsistent
* Hard to know which operations are valid in which states
* Testing requires covering all edge cases manually

## TypeScript's Solution: Compile-Time State Validation

TypeScript's type system can model state machines that catch these errors before your code even runs. Let's build this up step by step.

### Step 1: Modeling States as Literal Types

```typescript
// TypeScript: Start with literal types for states
type IdleState = 'idle';
type LoadingState = 'loading';
type SuccessState = 'success';
type ErrorState = 'error';

// Union type represents all possible states
type AppState = IdleState | LoadingState | SuccessState | ErrorState;

// This gives us compile-time validation:
let currentState: AppState = 'idle'; // ✅ Valid
let badState: AppState = 'unknown'; // ❌ Compiler error!
```

> **Key Mental Model** : Literal types turn string values into distinct types. `'idle'` isn't just a string - it's the type that only contains the value `'idle'`.

### Step 2: State Objects with Associated Data

Real state machines need data associated with each state:

```typescript
// Each state is an object with a tag and associated data
type IdleState = {
  status: 'idle';
  // No additional data needed
};

type LoadingState = {
  status: 'loading';
  startTime: number;
};

type SuccessState = {
  status: 'success';
  data: string;
  loadTime: number;
};

type ErrorState = {
  status: 'error';
  error: string;
  retryCount: number;
};

// Union of all possible states
type LoadingMachineState = IdleState | LoadingState | SuccessState | ErrorState;
```

> **Discriminated Unions** : The `status` field acts as a "discriminant" - TypeScript uses it to narrow which state type we're dealing with.

### Step 3: Type Guards for State Narrowing

```typescript
// Type guard functions help TypeScript understand current state
function isIdle(state: LoadingMachineState): state is IdleState {
  return state.status === 'idle';
}

function isLoading(state: LoadingMachineState): state is LoadingState {
  return state.status === 'loading';
}

function isSuccess(state: LoadingMachineState): state is SuccessState {
  return state.status === 'success';
}

function isError(state: LoadingMachineState): state is ErrorState {
  return state.status === 'error';
}

// Usage with automatic type narrowing:
function handleState(state: LoadingMachineState) {
  if (isSuccess(state)) {
    // TypeScript knows this is SuccessState
    console.log(state.data); // ✅ 'data' property is available
    console.log(state.error); // ❌ Compiler error - no 'error' on SuccessState
  }
}
```

### Step 4: Defining Valid Transitions

Now comes the magic - we define which state transitions are valid using conditional types:

```typescript
// Define valid transitions using mapped types
type ValidTransitions = {
  idle: 'loading';
  loading: 'success' | 'error';
  success: 'loading'; // Can reload
  error: 'loading' | 'idle'; // Can retry or reset
};

// Type-level function to check if transition is valid
type CanTransition<From, To> = To extends ValidTransitions[From] ? true : false;

// Examples of the type-level validation:
type Test1 = CanTransition<'idle', 'loading'>; // true
type Test2 = CanTransition<'idle', 'success'>; // false - can't succeed without loading!
type Test3 = CanTransition<'loading', 'error'>; // true
```

> **Conditional Types** : `T extends U ? X : Y` is TypeScript's if-then-else at the type level. If type `T` is assignable to type `U`, the result is `X`, otherwise `Y`.

### Step 5: State Machine Class with Type Validation

```typescript
class TypedLoadingMachine<TState extends LoadingMachineState = IdleState> {
  constructor(private state: TState) {}
  
  // Transition method with compile-time validation
  transition<TNext extends ValidTransitions[TState['status']]>(
    nextStatus: TNext,
    updateFn: (current: TState) => Extract<LoadingMachineState, { status: TNext }>
  ): TypedLoadingMachine<Extract<LoadingMachineState, { status: TNext }>> {
    const nextState = updateFn(this.state);
    return new TypedLoadingMachine(nextState);
  }
  
  getState(): TState {
    return this.state;
  }
}

// Usage with compile-time validation:
const machine = new TypedLoadingMachine({ status: 'idle' });

// ✅ Valid transition: idle -> loading
const loading = machine.transition('loading', () => ({
  status: 'loading',
  startTime: Date.now()
}));

// ❌ Compiler error: idle -> success is not valid!
const invalid = machine.transition('success', () => ({
  status: 'success',
  data: 'test',
  loadTime: 100
}));
```

### ASCII Diagram: Type-Level State Machine Flow

```
Compile Time          Runtime
     |                   |
     v                   v
State Types ——————————> Actual Objects
     |                   |
     v                   v
Transition Types ———————> Method Calls
     |                   |
     v                   v
Type Checking ——————————> Execution
     |                   |
     v                   v
Compilation ————————————> No Runtime Errors
```

## Advanced Pattern: Event-Driven State Machines

Let's take this further with events that trigger state transitions:

```typescript
// Define events that can trigger transitions
type LoadingEvents = {
  START_LOADING: { timeout?: number };
  LOADING_SUCCESS: { data: string; duration: number };
  LOADING_ERROR: { error: string; canRetry: boolean };
  RETRY: {};
  RESET: {};
};

// Map events to valid source states
type EventToSourceStates = {
  START_LOADING: 'idle' | 'success' | 'error';
  LOADING_SUCCESS: 'loading';
  LOADING_ERROR: 'loading';
  RETRY: 'error';
  RESET: 'success' | 'error';
};

// Map events to target states
type EventToTargetState = {
  START_LOADING: 'loading';
  LOADING_SUCCESS: 'success';
  LOADING_ERROR: 'error';
  RETRY: 'loading';
  RESET: 'idle';
};

// Type-level validation for event handling
type CanHandleEvent
  TCurrentState extends LoadingMachineState['status'],
  TEvent extends keyof LoadingEvents
> = TCurrentState extends EventToSourceStates[TEvent] ? true : false;

class EventDrivenStateMachine<TState extends LoadingMachineState = IdleState> {
  constructor(private state: TState) {}
  
  // Handle event with compile-time validation
  handleEvent
    TEvent extends keyof LoadingEvents,
    // Only allow events valid for current state
    _Check = CanHandleEvent<TState['status'], TEvent> extends true 
      ? unknown 
      : never
  >(
    event: TEvent,
    payload: LoadingEvents[TEvent]
  ): EventDrivenStateMachine
    Extract<LoadingMachineState, { status: EventToTargetState[TEvent] }>
  > {
    const nextState = this.computeNextState(event, payload);
    return new EventDrivenStateMachine(nextState);
  }
  
  private computeNextState<TEvent extends keyof LoadingEvents>(
    event: TEvent,
    payload: LoadingEvents[TEvent]
  ): Extract<LoadingMachineState, { status: EventToTargetState[TEvent] }> {
    switch (event) {
      case 'START_LOADING':
        return { 
          status: 'loading', 
          startTime: Date.now() 
        } as Extract<LoadingMachineState, { status: EventToTargetState[TEvent] }>;
    
      case 'LOADING_SUCCESS':
        const successPayload = payload as LoadingEvents['LOADING_SUCCESS'];
        return {
          status: 'success',
          data: successPayload.data,
          loadTime: successPayload.duration
        } as Extract<LoadingMachineState, { status: EventToTargetState[TEvent] }>;
    
      case 'LOADING_ERROR':
        const errorPayload = payload as LoadingEvents['LOADING_ERROR'];
        return {
          status: 'error',
          error: errorPayload.error,
          retryCount: 0
        } as Extract<LoadingMachineState, { status: EventToTargetState[TEvent] }>;
    
      default:
        throw new Error(`Unhandled event: ${event}`);
    }
  }
}

// Usage with event-driven validation:
const eventMachine = new EventDrivenStateMachine({ status: 'idle' });

// ✅ Valid: idle state can handle START_LOADING
const loading = eventMachine.handleEvent('START_LOADING', { timeout: 5000 });

// ✅ Valid: loading state can handle LOADING_SUCCESS
const success = loading.handleEvent('LOADING_SUCCESS', { 
  data: 'result', 
  duration: 2000 
});

// ❌ Compiler error: idle state cannot handle LOADING_SUCCESS!
const invalid = eventMachine.handleEvent('LOADING_SUCCESS', { 
  data: 'test', 
  duration: 100 
});
```

## Complex Example: Multi-Step Form State Machine

Here's a real-world example showing how type-level state machines can model complex business logic:

```typescript
// Multi-step form with validation states
type FormStates = {
  collecting_personal: {
    status: 'collecting_personal';
    personalData?: { name: string; email: string };
  };
  
  validating_personal: {
    status: 'validating_personal';
    personalData: { name: string; email: string };
  };
  
  collecting_payment: {
    status: 'collecting_payment';
    personalData: { name: string; email: string };
    paymentData?: { cardNumber: string; cvv: string };
  };
  
  processing_payment: {
    status: 'processing_payment';
    personalData: { name: string; email: string };
    paymentData: { cardNumber: string; cvv: string };
  };
  
  completed: {
    status: 'completed';
    personalData: { name: string; email: string };
    paymentData: { cardNumber: string; cvv: string };
    confirmationId: string;
  };
  
  error: {
    status: 'error';
    errorMessage: string;
    previousState: 'validating_personal' | 'processing_payment';
  };
};

type FormState = FormStates[keyof FormStates];

// Define valid transitions for the form
type FormTransitions = {
  collecting_personal: 'validating_personal';
  validating_personal: 'collecting_payment' | 'error';
  collecting_payment: 'processing_payment';
  processing_payment: 'completed' | 'error';
  completed: never; // Terminal state
  error: 'collecting_personal' | 'collecting_payment'; // Can retry
};

// Type-safe form state machine
class FormStateMachine<TState extends FormState> {
  constructor(private state: TState) {}
  
  // Type-safe transitions with payload validation
  moveToValidation<T extends TState>(
    this: T extends FormStates['collecting_personal'] ? FormStateMachine<T> : never
  ): FormStateMachine<FormStates['validating_personal']> {
    const currentState = this.state as FormStates['collecting_personal'];
  
    if (!currentState.personalData) {
      throw new Error('Cannot validate without personal data');
    }
  
    return new FormStateMachine({
      status: 'validating_personal',
      personalData: currentState.personalData
    });
  }
  
  moveToPayment<T extends TState>(
    this: T extends FormStates['validating_personal'] ? FormStateMachine<T> : never
  ): FormStateMachine<FormStates['collecting_payment']> {
    const currentState = this.state as FormStates['validating_personal'];
  
    return new FormStateMachine({
      status: 'collecting_payment',
      personalData: currentState.personalData
    });
  }
  
  // Error transitions preserve context
  moveToError<T extends TState>(
    this: T extends FormStates['validating_personal'] | FormStates['processing_payment'] 
      ? FormStateMachine<T> 
      : never,
    errorMessage: string
  ): FormStateMachine<FormStates['error']> {
    const currentState = this.state;
  
    return new FormStateMachine({
      status: 'error',
      errorMessage,
      previousState: currentState.status as 'validating_personal' | 'processing_payment'
    });
  }
  
  getCurrentState(): TState {
    return this.state;
  }
}

// Usage shows compile-time validation:
const form = new FormStateMachine({ 
  status: 'collecting_personal',
  personalData: { name: 'John', email: 'john@example.com' }
});

// ✅ Valid progression
const validating = form.moveToValidation();
const payment = validating.moveToPayment();

// ❌ Compiler error: can't go to payment directly from collecting_personal
const invalid = form.moveToPayment();

// ❌ Compiler error: can't create error from collecting_personal state
const alsoInvalid = form.moveToError('test error');
```

> **Advanced Pattern** : Notice how we use `this` parameter types to constrain methods to only work when the machine is in specific states. This provides method-level state validation.

## Key Benefits and Mental Models

> **Compile-Time Safety** : State machines defined in the type system catch invalid transitions before code runs, eliminating entire classes of runtime bugs.

> **Self-Documenting Code** : The type definitions serve as living documentation of your system's valid states and transitions.

> **IDE Support** : Autocomplete and error highlighting work perfectly because the compiler understands your state machine's constraints.

> **Refactoring Safety** : When you change state definitions, TypeScript will show you everywhere that needs updating.

## Common Gotchas and Best Practices

> **Gotcha** : Type-level state machines exist only at compile time. At runtime, you're still working with regular JavaScript objects.

> **Best Practice** : Always include runtime validation alongside your type-level constraints for defense in depth.

> **Gotcha** : Complex state machines can create very long type names that are hard to debug.

> **Best Practice** : Use type aliases and break complex types into smaller, composable pieces.

```typescript
// ❌ Hard to debug
type ComplexMachine<T> = T extends SomeComplexCondition<T> 
  ? VeryLongTypeExpression<T> 
  : AnotherLongTypeExpression<T>;

// ✅ Easier to understand
type StateConstraint<T> = T extends SomeComplexCondition<T> ? T : never;
type ValidState<T> = StateConstraint<T> extends never 
  ? AnotherLongTypeExpression<T> 
  : VeryLongTypeExpression<T>;
type ComplexMachine<T> = ValidState<T>;
```

Type-level state machines represent one of TypeScript's most powerful patterns for encoding business logic directly into the type system. They transform runtime bugs into compile-time errors, making your applications more reliable and your development experience more productive.
