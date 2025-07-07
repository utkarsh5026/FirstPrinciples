# Streaming Data Processing: From First Principles

Let me build up streaming data processing concepts from the absolute fundamentals, showing you both the theory and practical Python implementations.

## 1. Fundamental Data Processing Concepts

### The Core Problem: Processing Data Over Time

Before diving into streaming, let's understand the fundamental challenge:

```python
# Traditional approach: Process ALL data at once (batch processing)
def process_all_data(data_list):
    """Process complete dataset - requires all data to be available"""
    results = []
    for item in data_list:
        processed = expensive_transformation(item)
        results.append(processed)
    return results

# Problem: What if data keeps arriving continuously?
# Problem: What if dataset is too large for memory?
# Problem: What if we need results immediately, not after hours?
```

> **Key Mental Model** : Think of batch processing like reading an entire book before taking notes, vs streaming processing like taking notes while someone is speaking to you in real-time.

### Batch vs Streaming: A Fundamental Distinction

```
Batch Processing:
[Data] → [Wait] → [Process All] → [Results]
   |        |         |            |
   Day 1   Day 2     Day 3       Day 3

Streaming Processing:
[Data₁] → [Process] → [Result₁] (immediate)
[Data₂] → [Process] → [Result₂] (immediate)  
[Data₃] → [Process] → [Result₃] (immediate)
```

## 2. What Is Streaming Data Processing?

### Core Definition and Properties

```python
# Streaming data processing: Handle data as it arrives
import time
from collections import deque

class StreamProcessor:
    """Basic streaming processor - handles data item by item"""
  
    def __init__(self):
        self.buffer = deque(maxlen=1000)  # Limited memory
        self.processed_count = 0
  
    def process_item(self, data_item):
        """Process single item immediately"""
        # Simulate processing time
        result = data_item * 2  # Simple transformation
        self.buffer.append(result)
        self.processed_count += 1
        return result
  
    def stream_data(self, data_source):
        """Process data as it arrives"""
        for item in data_source:
            yield self.process_item(item)
            # Each item is processed and returned immediately
            # No waiting for entire dataset
```

> **Streaming Characteristics** :
>
> * **Unbounded data** : Data keeps arriving indefinitely
> * **Low latency** : Results needed quickly, often in milliseconds
> * **Limited memory** : Can't store all historical data
> * **Continuous processing** : System never "finishes" - it keeps running

### The Event-Driven Model

```python
# Streaming is fundamentally event-driven
class EventDrivenProcessor:
    """Shows the event-driven nature of streaming"""
  
    def __init__(self):
        self.event_handlers = {}
        self.state = {}
  
    def on_event(self, event_type, handler):
        """Register handler for event type"""
        self.event_handlers[event_type] = handler
  
    def process_event(self, event):
        """Process incoming event immediately"""
        event_type = event.get('type')
        if event_type in self.event_handlers:
            # React to event as it happens
            self.event_handlers[event_type](event, self.state)

# Example usage
processor = EventDrivenProcessor()

def handle_user_click(event, state):
    print(f"User clicked: {event['data']}")
    state['clicks'] = state.get('clicks', 0) + 1

def handle_sensor_reading(event, state):
    reading = event['data']
    if reading > 100:  # Immediate threshold check
        print(f"ALERT: High reading detected: {reading}")

processor.on_event('click', handle_user_click)
processor.on_event('sensor', handle_sensor_reading)
```

## 3. Pipeline Concepts and Architecture

### Understanding the Pipeline Metaphor

```
Basic Pipeline Concept:
[Source] → [Transform] → [Filter] → [Aggregate] → [Sink]
   |           |           |           |          |
Raw Data   Clean Data  Valid Data  Summary    Storage
```

### Building Pipelines in Python

```python
from abc import ABC, abstractmethod
from typing import Iterator, Any, Callable

class PipelineStage(ABC):
    """Base class for pipeline stages"""
  
    @abstractmethod
    def process(self, data_stream: Iterator[Any]) -> Iterator[Any]:
        """Process the data stream"""
        pass

class TransformStage(PipelineStage):
    """Transform each data item"""
  
    def __init__(self, transform_func: Callable):
        self.transform_func = transform_func
  
    def process(self, data_stream: Iterator[Any]) -> Iterator[Any]:
        for item in data_stream:
            try:
                transformed = self.transform_func(item)
                yield transformed
            except Exception as e:
                # Error handling in streaming is crucial
                print(f"Transform error: {e}")
                continue  # Skip bad data, keep stream flowing

class FilterStage(PipelineStage):
    """Filter data based on predicate"""
  
    def __init__(self, predicate: Callable[[Any], bool]):
        self.predicate = predicate
  
    def process(self, data_stream: Iterator[Any]) -> Iterator[Any]:
        for item in data_stream:
            if self.predicate(item):
                yield item
            # Filtered items are dropped from stream

class Pipeline:
    """Compose multiple stages into a pipeline"""
  
    def __init__(self):
        self.stages = []
  
    def add_stage(self, stage: PipelineStage):
        self.stages.append(stage)
        return self  # Allow chaining
  
    def process(self, data_source: Iterator[Any]) -> Iterator[Any]:
        """Process data through all stages"""
        current_stream = data_source
      
        # Chain stages together
        for stage in self.stages:
            current_stream = stage.process(current_stream)
      
        return current_stream

# Example: Building a data processing pipeline
def parse_log_line(line):
    """Parse log line into structured data"""
    parts = line.strip().split(' ')
    return {
        'timestamp': parts[0],
        'level': parts[1],
        'message': ' '.join(parts[2:])
    }

def is_error_log(log_entry):
    """Filter for error logs only"""
    return log_entry['level'] == 'ERROR'

# Build pipeline
pipeline = Pipeline()
pipeline.add_stage(TransformStage(parse_log_line))
pipeline.add_stage(FilterStage(is_error_log))

# Process streaming log data
log_lines = [
    "2025-01-01 INFO Application started",
    "2025-01-01 ERROR Database connection failed",
    "2025-01-01 INFO User logged in",
    "2025-01-01 ERROR Out of memory"
]

for error_log in pipeline.process(iter(log_lines)):
    print(f"Error detected: {error_log}")
```

### Pipeline Optimization Strategies

> **Pipeline Optimization Principles** :
>
> * **Minimize data copying** : Use generators and iterators
> * **Parallel processing** : Process independent items concurrently
> * **Batch operations** : Group small operations for efficiency
> * **Resource pooling** : Reuse expensive resources like database connections

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time

class OptimizedPipeline:
    """Demonstrates various optimization techniques"""
  
    def __init__(self, max_workers=4):
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.batch_size = 100
  
    def parallel_process(self, data_stream, process_func):
        """Process items in parallel using thread pool"""
      
        def batch_generator(stream, batch_size):
            """Group stream into batches"""
            batch = []
            for item in stream:
                batch.append(item)
                if len(batch) >= batch_size:
                    yield batch
                    batch = []
            if batch:  # Don't forget the last batch
                yield batch
      
        for batch in batch_generator(data_stream, self.batch_size):
            # Submit batch for parallel processing
            futures = [
                self.executor.submit(process_func, item) 
                for item in batch
            ]
          
            # Yield results as they complete
            for future in futures:
                try:
                    yield future.result(timeout=5.0)
                except Exception as e:
                    print(f"Processing error: {e}")
                    continue

# Memory-efficient processing using generators
def memory_efficient_transform(data_stream):
    """Transform without loading all data into memory"""
    for item in data_stream:
        # Process one item at a time
        # Memory usage stays constant
        yield item.upper().strip()

# Lazy evaluation - computation happens only when needed
def lazy_pipeline(data_source):
    """Nothing processes until someone asks for results"""
    transformed = (item.upper() for item in data_source)
    filtered = (item for item in transformed if len(item) > 5)
    return filtered  # No computation happened yet!

# Only when we iterate does processing occur
data = ["hello", "world", "streaming", "data"]
pipeline = lazy_pipeline(data)
# Still no processing...

for result in pipeline:  # NOW processing happens
    print(result)
```

## 4. Backpressure Handling

### Understanding Backpressure

> **Backpressure Definition** : When downstream components cannot keep up with the rate of data from upstream components, causing data to accumulate and potentially leading to system failure.

```
Normal Flow:
Producer → [Buffer] → Consumer
  1000/s    [10]      1000/s ✓

Backpressure Situation:
Producer → [Buffer] → Consumer  
  1000/s    [FULL]     500/s ⚠️
            ↑
         Buffer overflow!
```

### Backpressure Detection and Handling

```python
import queue
import threading
import time
from dataclasses import dataclass
from typing import Optional

@dataclass
class BackpressureMetrics:
    """Track backpressure indicators"""
    buffer_size: int
    buffer_capacity: int
    processing_rate: float
    input_rate: float
  
    @property
    def buffer_utilization(self) -> float:
        return self.buffer_size / self.buffer_capacity
  
    @property
    def is_backpressure(self) -> bool:
        return (self.buffer_utilization > 0.8 or 
                self.input_rate > self.processing_rate * 1.2)

class BackpressureAwareProcessor:
    """Processor that monitors and handles backpressure"""
  
    def __init__(self, buffer_capacity=1000):
        self.buffer = queue.Queue(maxsize=buffer_capacity)
        self.buffer_capacity = buffer_capacity
        self.processed_count = 0
        self.dropped_count = 0
        self.start_time = time.time()
      
    def try_enqueue(self, item, timeout=0.1):
        """Try to add item, handling backpressure"""
        try:
            self.buffer.put(item, timeout=timeout)
            return True
        except queue.Full:
            # Backpressure detected - handle gracefully
            return self._handle_backpressure(item)
  
    def _handle_backpressure(self, item):
        """Different strategies for handling backpressure"""
      
        # Strategy 1: Drop oldest items (sliding window)
        try:
            self.buffer.get_nowait()  # Remove oldest
            self.buffer.put_nowait(item)  # Add new
            self.dropped_count += 1
            print("Backpressure: Dropped oldest item")
            return True
        except queue.Empty:
            pass
      
        # Strategy 2: Drop current item
        self.dropped_count += 1
        print("Backpressure: Dropped current item")
        return False
  
    def process_with_backpressure_monitoring(self):
        """Process items while monitoring backpressure"""
        while True:
            try:
                item = self.buffer.get(timeout=1.0)
              
                # Simulate processing time
                time.sleep(0.01)  # 10ms processing time
              
                self.processed_count += 1
              
                # Monitor backpressure every 100 items
                if self.processed_count % 100 == 0:
                    self._report_metrics()
                  
            except queue.Empty:
                continue
  
    def _report_metrics(self):
        """Report current backpressure metrics"""
        elapsed = time.time() - self.start_time
        processing_rate = self.processed_count / elapsed
      
        metrics = BackpressureMetrics(
            buffer_size=self.buffer.qsize(),
            buffer_capacity=self.buffer_capacity,
            processing_rate=processing_rate,
            input_rate=0  # Would track in real implementation
        )
      
        print(f"Buffer: {metrics.buffer_size}/{metrics.buffer_capacity} "
              f"({metrics.buffer_utilization:.1%}) "
              f"Rate: {processing_rate:.1f}/s "
              f"Dropped: {self.dropped_count}")
```

### Advanced Backpressure Strategies

```python
import asyncio
from enum import Enum

class BackpressureStrategy(Enum):
    DROP_OLDEST = "drop_oldest"
    DROP_NEWEST = "drop_newest"
    SLOW_DOWN_PRODUCER = "slow_down"
    BUFFER_EXPANSION = "expand_buffer"

class AdaptiveBackpressureHandler:
    """Adaptive backpressure handling with multiple strategies"""
  
    def __init__(self, initial_capacity=1000):
        self.buffer = asyncio.Queue(maxsize=initial_capacity)
        self.capacity = initial_capacity
        self.strategy = BackpressureStrategy.DROP_OLDEST
        self.backpressure_events = 0
      
    async def adaptive_put(self, item):
        """Adaptively handle item insertion based on current conditions"""
      
        if self.buffer.full():
            self.backpressure_events += 1
          
            # Adapt strategy based on frequency of backpressure
            if self.backpressure_events > 100:
                await self._escalate_strategy()
          
            return await self._apply_strategy(item)
        else:
            await self.buffer.put(item)
            return True
  
    async def _apply_strategy(self, item):
        """Apply current backpressure strategy"""
      
        if self.strategy == BackpressureStrategy.DROP_OLDEST:
            try:
                self.buffer.get_nowait()  # Remove oldest
                await self.buffer.put(item)
                return True
            except asyncio.QueueEmpty:
                return False
              
        elif self.strategy == BackpressureStrategy.DROP_NEWEST:
            return False  # Drop the new item
          
        elif self.strategy == BackpressureStrategy.SLOW_DOWN_PRODUCER:
            # Signal producer to slow down
            await asyncio.sleep(0.1)  # Artificial delay
            try:
                await asyncio.wait_for(self.buffer.put(item), timeout=1.0)
                return True
            except asyncio.TimeoutError:
                return False
              
        elif self.strategy == BackpressureStrategy.BUFFER_EXPANSION:
            # Temporarily expand buffer (risky!)
            if self.capacity < 10000:  # Safety limit
                self.capacity *= 2
                print(f"Buffer expanded to {self.capacity}")
            await self.buffer.put(item)
            return True
  
    async def _escalate_strategy(self):
        """Escalate to more aggressive backpressure handling"""
        strategies = [
            BackpressureStrategy.DROP_OLDEST,
            BackpressureStrategy.SLOW_DOWN_PRODUCER,
            BackpressureStrategy.BUFFER_EXPANSION,
            BackpressureStrategy.DROP_NEWEST
        ]
      
        current_index = strategies.index(self.strategy)
        if current_index < len(strategies) - 1:
            self.strategy = strategies[current_index + 1]
            print(f"Escalated to strategy: {self.strategy.value}")
            self.backpressure_events = 0  # Reset counter
```

## 5. Real-Time Processing Patterns

### Event Time vs Processing Time

> **Critical Distinction** :
>
> * **Event Time** : When the event actually occurred
> * **Processing Time** : When the system processes the event
>
> These can differ significantly in real-world systems!

```python
from datetime import datetime, timedelta
import time

class TimestampedEvent:
    """Event with both event time and processing time"""
  
    def __init__(self, data, event_time=None):
        self.data = data
        self.event_time = event_time or datetime.now()
        self.processing_time = None  # Set when processed
      
    def mark_processed(self):
        self.processing_time = datetime.now()
      
    @property
    def latency(self):
        """Time between event and processing"""
        if self.processing_time:
            return self.processing_time - self.event_time
        return None

class RealTimeProcessor:
    """Handles real-time processing with time awareness"""
  
    def __init__(self, max_latency_ms=1000):
        self.max_latency = timedelta(milliseconds=max_latency_ms)
        self.late_events = 0
      
    def process_event(self, event: TimestampedEvent):
        """Process event with latency monitoring"""
        event.mark_processed()
      
        # Check if event is too late
        if event.latency > self.max_latency:
            self.late_events += 1
            print(f"Late event detected: {event.latency.total_seconds():.3f}s")
          
            # Decide how to handle late events
            return self._handle_late_event(event)
      
        return self._process_on_time_event(event)
  
    def _handle_late_event(self, event):
        """Handle events that arrive too late"""
        # Option 1: Drop late events
        # return None
      
        # Option 2: Process with warning
        print(f"Processing late event: {event.data}")
        return event.data
      
        # Option 3: Reorder events (complex)
        # Would require buffering and sorting
  
    def _process_on_time_event(self, event):
        """Process events that arrive on time"""
        return f"Processed: {event.data}"
```

### Windowing for Stream Processing

```python
from collections import defaultdict, deque
from typing import Dict, List, Callable

class WindowType(Enum):
    TUMBLING = "tumbling"    # Non-overlapping, fixed-size
    SLIDING = "sliding"      # Overlapping, fixed-size
    SESSION = "session"      # Dynamic, gap-based

class StreamWindow:
    """Base class for stream windowing"""
  
    def __init__(self, window_size_ms: int):
        self.window_size = timedelta(milliseconds=window_size_ms)
        self.events = deque()
      
    def add_event(self, event: TimestampedEvent):
        """Add event to window"""
        self.events.append(event)
        self._expire_old_events()
      
    def _expire_old_events(self):
        """Remove events outside window"""
        cutoff_time = datetime.now() - self.window_size
        while self.events and self.events[0].event_time < cutoff_time:
            self.events.popleft()
  
    def get_current_events(self) -> List[TimestampedEvent]:
        """Get all events in current window"""
        self._expire_old_events()
        return list(self.events)

class TumblingWindow(StreamWindow):
    """Non-overlapping time windows"""
  
    def __init__(self, window_size_ms: int, aggregate_func: Callable):
        super().__init__(window_size_ms)
        self.aggregate_func = aggregate_func
        self.last_window_end = datetime.now()
      
    def check_window_complete(self) -> bool:
        """Check if current window is complete"""
        now = datetime.now()
        if now >= self.last_window_end + self.window_size:
            # Window is complete
            result = self._finalize_window()
            self.last_window_end = now
            return result
        return None
  
    def _finalize_window(self):
        """Finalize and aggregate current window"""
        events = self.get_current_events()
        if events:
            values = [event.data for event in events]
            result = self.aggregate_func(values)
            print(f"Window complete: {len(events)} events -> {result}")
            return result
        return None

# Example: Real-time analytics with windowing
class RealTimeAnalytics:
    """Real-time analytics using windowing"""
  
    def __init__(self):
        # Different windows for different metrics
        self.count_window = TumblingWindow(5000, len)  # 5-second counts
        self.avg_window = TumblingWindow(10000, lambda x: sum(x)/len(x))  # 10-second averages
        self.metrics = defaultdict(list)
  
    def process_metric(self, metric_name: str, value: float):
        """Process incoming metric"""
        event = TimestampedEvent(value)
      
        # Add to appropriate windows
        if metric_name == "requests":
            self.count_window.add_event(event)
            count_result = self.count_window.check_window_complete()
            if count_result:
                print(f"Request rate: {count_result/5:.1f} requests/second")
      
        elif metric_name == "response_time":
            self.avg_window.add_event(event)
            avg_result = self.avg_window.check_window_complete()
            if avg_result:
                print(f"Average response time: {avg_result:.2f}ms")

# Usage example
analytics = RealTimeAnalytics()

# Simulate real-time metrics
for i in range(100):
    analytics.process_metric("requests", 1)
    analytics.process_metric("response_time", 50 + i * 2)
    time.sleep(0.1)  # 100ms between metrics
```

### Complex Event Processing (CEP)

```python
class EventPattern:
    """Define patterns to detect in event streams"""
  
    def __init__(self, pattern_name: str):
        self.pattern_name = pattern_name
        self.conditions = []
        self.matched_events = []
      
    def add_condition(self, condition_func: Callable):
        """Add condition to pattern"""
        self.conditions.append(condition_func)
        return self
  
    def check_pattern(self, event: TimestampedEvent) -> bool:
        """Check if event completes the pattern"""
        # Simple sequential pattern matching
        condition_index = len(self.matched_events)
      
        if condition_index < len(self.conditions):
            if self.conditions[condition_index](event):
                self.matched_events.append(event)
              
                # Pattern complete?
                if len(self.matched_events) == len(self.conditions):
                    print(f"Pattern '{self.pattern_name}' detected!")
                    self._reset_pattern()
                    return True
        else:
            # Pattern was already complete, start over
            self._reset_pattern()
          
        return False
  
    def _reset_pattern(self):
        """Reset pattern for next detection"""
        self.matched_events = []

class ComplexEventProcessor:
    """Process complex event patterns"""
  
    def __init__(self):
        self.patterns = []
        self.active_sessions = defaultdict(list)
  
    def add_pattern(self, pattern: EventPattern):
        """Add pattern to detect"""
        self.patterns.append(pattern)
  
    def process_event(self, event: TimestampedEvent):
        """Process event against all patterns"""
        for pattern in self.patterns:
            if pattern.check_pattern(event):
                self._handle_pattern_match(pattern, event)
  
    def _handle_pattern_match(self, pattern: EventPattern, triggering_event: TimestampedEvent):
        """Handle detected pattern"""
        print(f"Action triggered by pattern: {pattern.pattern_name}")
        # Could trigger alerts, start workflows, etc.

# Example: Fraud detection pattern
fraud_detector = ComplexEventProcessor()

# Define fraud pattern: Login -> Large Transfer -> Quick Logout
fraud_pattern = EventPattern("potential_fraud")
fraud_pattern.add_condition(lambda e: e.data.get('type') == 'login')
fraud_pattern.add_condition(lambda e: e.data.get('type') == 'transfer' and e.data.get('amount', 0) > 10000)
fraud_pattern.add_condition(lambda e: e.data.get('type') == 'logout')

fraud_detector.add_pattern(fraud_pattern)

# Simulate event stream
events = [
    {'type': 'login', 'user': 'user123'},
    {'type': 'transfer', 'amount': 15000, 'user': 'user123'},
    {'type': 'logout', 'user': 'user123'}
]

for event_data in events:
    event = TimestampedEvent(event_data)
    fraud_detector.process_event(event)
```

## 6. Advanced Real-World Patterns

### Exactly-Once Processing

> **The Exactly-Once Challenge** : In distributed systems, ensuring each message is processed exactly once (not zero times, not multiple times) is extremely difficult but often required for financial or critical systems.

```python
import hashlib
import sqlite3
from contextlib import contextmanager

class ExactlyOnceProcessor:
    """Implement exactly-once processing semantics"""
  
    def __init__(self, db_path=":memory:"):
        self.db_path = db_path
        self._init_db()
  
    def _init_db(self):
        """Initialize deduplication database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS processed_events (
                    event_id TEXT PRIMARY KEY,
                    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    result TEXT
                )
            """)
  
    def _generate_event_id(self, event_data):
        """Generate deterministic ID for event"""
        # Create hash from event content
        content = str(sorted(event_data.items()))
        return hashlib.sha256(content.encode()).hexdigest()[:16]
  
    @contextmanager
    def _transaction(self):
        """Database transaction context"""
        conn = sqlite3.connect(self.db_path)
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
  
    def process_event_exactly_once(self, event_data, process_func):
        """Process event with exactly-once semantics"""
        event_id = self._generate_event_id(event_data)
      
        with self._transaction() as conn:
            # Check if already processed
            cursor = conn.execute(
                "SELECT result FROM processed_events WHERE event_id = ?",
                (event_id,)
            )
            existing = cursor.fetchone()
          
            if existing:
                print(f"Event {event_id} already processed, returning cached result")
                return existing[0]
          
            # Process event
            try:
                result = process_func(event_data)
              
                # Store result atomically
                conn.execute(
                    "INSERT INTO processed_events (event_id, result) VALUES (?, ?)",
                    (event_id, str(result))
                )
              
                print(f"Event {event_id} processed successfully")
                return result
              
            except Exception as e:
                print(f"Event {event_id} processing failed: {e}")
                raise

# Example usage
processor = ExactlyOnceProcessor()

def expensive_operation(event_data):
    """Simulate expensive operation that should happen exactly once"""
    amount = event_data.get('amount', 0)
    fee = amount * 0.01
    print(f"Processing payment: ${amount}, fee: ${fee}")
    return f"Processed ${amount} with ${fee} fee"

# Process same event multiple times
event = {'user': 'user123', 'amount': 1000, 'timestamp': '2025-01-01'}

result1 = processor.process_event_exactly_once(event, expensive_operation)
result2 = processor.process_event_exactly_once(event, expensive_operation)  # Should use cached result

print(f"Result 1: {result1}")
print(f"Result 2: {result2}")
print(f"Same result: {result1 == result2}")
```

### Fault Tolerance and Recovery

```python
import pickle
import os
from typing import Optional

class CheckpointManager:
    """Manage checkpoints for fault tolerance"""
  
    def __init__(self, checkpoint_dir="./checkpoints"):
        self.checkpoint_dir = checkpoint_dir
        os.makedirs(checkpoint_dir, exist_ok=True)
      
    def save_checkpoint(self, processor_state, checkpoint_id):
        """Save processor state to disk"""
        checkpoint_path = os.path.join(self.checkpoint_dir, f"checkpoint_{checkpoint_id}.pkl")
        with open(checkpoint_path, 'wb') as f:
            pickle.dump(processor_state, f)
        print(f"Checkpoint saved: {checkpoint_id}")
  
    def load_checkpoint(self, checkpoint_id) -> Optional[dict]:
        """Load processor state from disk"""
        checkpoint_path = os.path.join(self.checkpoint_dir, f"checkpoint_{checkpoint_id}.pkl")
        try:
            with open(checkpoint_path, 'rb') as f:
                state = pickle.load(f)
            print(f"Checkpoint loaded: {checkpoint_id}")
            return state
        except FileNotFoundError:
            print(f"Checkpoint not found: {checkpoint_id}")
            return None

class FaultTolerantProcessor:
    """Streaming processor with fault tolerance"""
  
    def __init__(self, checkpoint_interval=1000):
        self.checkpoint_manager = CheckpointManager()
        self.checkpoint_interval = checkpoint_interval
        self.state = {
            'processed_count': 0,
            'last_event_id': None,
            'accumulator': 0
        }
        self.events_since_checkpoint = 0
      
    def recover_from_failure(self, checkpoint_id):
        """Recover processor state from checkpoint"""
        loaded_state = self.checkpoint_manager.load_checkpoint(checkpoint_id)
        if loaded_state:
            self.state = loaded_state
            print(f"Recovered from checkpoint. Processed: {self.state['processed_count']}")
            return True
        return False
  
    def process_event_with_recovery(self, event):
        """Process event with automatic checkpointing"""
        try:
            # Simulate processing
            result = self._process_single_event(event)
          
            # Update state
            self.state['processed_count'] += 1
            self.state['last_event_id'] = event.get('id')
            self.state['accumulator'] += event.get('value', 0)
            self.events_since_checkpoint += 1
          
            # Checkpoint periodically
            if self.events_since_checkpoint >= self.checkpoint_interval:
                self._create_checkpoint()
          
            return result
          
        except Exception as e:
            print(f"Processing failed: {e}")
            # Could implement retry logic here
            raise
  
    def _process_single_event(self, event):
        """Actual event processing logic"""
        # Simulate potential failure
        if event.get('value', 0) < 0:
            raise ValueError("Negative values not allowed")
      
        return event.get('value', 0) * 2
  
    def _create_checkpoint(self):
        """Create checkpoint of current state"""
        checkpoint_id = f"auto_{self.state['processed_count']}"
        self.checkpoint_manager.save_checkpoint(self.state, checkpoint_id)
        self.events_since_checkpoint = 0

# Example: Fault tolerance in action
processor = FaultTolerantProcessor(checkpoint_interval=3)

events = [
    {'id': 1, 'value': 10},
    {'id': 2, 'value': 20},
    {'id': 3, 'value': 30},
    {'id': 4, 'value': -5},  # This will cause failure
    {'id': 5, 'value': 40}
]

# Process events
for event in events:
    try:
        result = processor.process_event_with_recovery(event)
        print(f"Event {event['id']}: {result}")
    except ValueError as e:
        print(f"Skipping bad event {event['id']}: {e}")
        continue

print(f"Final state: {processor.state}")
```

## 7. Production Considerations

### Monitoring and Observability

```python
import logging
from dataclasses import dataclass, field
from typing import Dict
import time

@dataclass
class StreamMetrics:
    """Comprehensive streaming metrics"""
    events_processed: int = 0
    events_failed: int = 0
    average_latency_ms: float = 0.0
    throughput_per_second: float = 0.0
    buffer_utilization: float = 0.0
    error_rate: float = 0.0
  
    def update_error_rate(self):
        total_events = self.events_processed + self.events_failed
        self.error_rate = self.events_failed / total_events if total_events > 0 else 0.0

class ProductionStreamProcessor:
    """Production-ready streaming processor with full observability"""
  
    def __init__(self, name="stream_processor"):
        self.name = name
        self.metrics = StreamMetrics()
        self.start_time = time.time()
        self.latencies = deque(maxlen=1000)  # Keep last 1000 latencies
      
        # Setup logging
        self.logger = logging.getLogger(f"stream.{name}")
        self.logger.setLevel(logging.INFO)
      
        # Create handler if not exists
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
  
    def process_with_monitoring(self, event):
        """Process event with full monitoring"""
        start_time = time.time()
      
        try:
            # Process event
            result = self._process_event(event)
          
            # Record success metrics
            processing_time_ms = (time.time() - start_time) * 1000
            self.latencies.append(processing_time_ms)
            self.metrics.events_processed += 1
          
            # Update average latency
            self.metrics.average_latency_ms = sum(self.latencies) / len(self.latencies)
          
            # Update throughput
            elapsed_seconds = time.time() - self.start_time
            self.metrics.throughput_per_second = self.metrics.events_processed / elapsed_seconds
          
            # Log successful processing
            if self.metrics.events_processed % 1000 == 0:
                self.logger.info(f"Processed {self.metrics.events_processed} events. "
                               f"Avg latency: {self.metrics.average_latency_ms:.2f}ms, "
                               f"Throughput: {self.metrics.throughput_per_second:.1f}/s")
          
            return result
          
        except Exception as e:
            # Record failure metrics
            self.metrics.events_failed += 1
            self.metrics.update_error_rate()
          
            # Log error with context
            self.logger.error(f"Event processing failed: {e}", 
                            extra={'event_data': event, 'error_type': type(e).__name__})
          
            # Alert if error rate too high
            if self.metrics.error_rate > 0.05:  # 5% error rate
                self.logger.critical(f"High error rate detected: {self.metrics.error_rate:.2%}")
          
            raise
  
    def _process_event(self, event):
        """Actual event processing (implement your logic here)"""
        # Simulate processing
        time.sleep(0.001)  # 1ms processing time
        return f"Processed: {event}"
  
    def get_health_status(self) -> Dict[str, any]:
        """Get current health status"""
        return {
            'status': 'healthy' if self.metrics.error_rate < 0.01 else 'degraded',
            'metrics': {
                'events_processed': self.metrics.events_processed,
                'error_rate': f"{self.metrics.error_rate:.2%}",
                'average_latency_ms': f"{self.metrics.average_latency_ms:.2f}",
                'throughput_per_second': f"{self.metrics.throughput_per_second:.1f}",
            },
            'uptime_seconds': time.time() - self.start_time
        }

# Example: Production monitoring
processor = ProductionStreamProcessor("payment_processor")

# Simulate production load
import random
for i in range(10000):
    event = f"event_{i}"
  
    # Simulate occasional failures
    if random.random() < 0.001:  # 0.1% failure rate
        event = None  # This will cause an error
  
    try:
        processor.process_with_monitoring(event)
    except Exception:
        continue  # Skip failed events
  
    # Print health status periodically
    if i > 0 and i % 5000 == 0:
        health = processor.get_health_status()
        print(f"Health Status: {health}")
```

> **Key Takeaways for Production Streaming Systems** :
>
> 1. **Design for Failure** : Assume components will fail and design recovery mechanisms
> 2. **Monitor Everything** : Track latency, throughput, error rates, and resource usage
> 3. **Handle Backpressure** : Have strategies for when downstream can't keep up
> 4. **Exactly-Once Semantics** : Critical for financial and other sensitive applications
> 5. **Checkpoint Regularly** : Enable fast recovery from failures
> 6. **Scale Horizontally** : Design for adding more processing nodes
> 7. **Test at Scale** : Performance characteristics change dramatically with load

This comprehensive explanation builds streaming data processing from absolute first principles, showing you both the theoretical foundations and practical Python implementations. The concepts progress from basic data flow to sophisticated production patterns, giving you the tools to understand and implement real-world streaming systems.
