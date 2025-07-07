
# Distributed Computing with Python: From First Principles

Let's build understanding of distributed computing from the ground up, starting with fundamental computational concepts and progressing to advanced Python implementations.

## 1. Fundamental Computational Thinking

Before diving into distributed systems, let's understand the core problem we're solving:

**Single Computer Limitations:**

```python
# Traditional sequential processing
import time

def process_large_dataset(data):
    """Process data sequentially - one item at a time"""
    results = []
    start_time = time.time()
  
    for item in data:
        # Simulate complex computation (e.g., image processing, ML training)
        result = expensive_computation(item)  # Takes 1 second per item
        results.append(result)
  
    print(f"Processed {len(data)} items in {time.time() - start_time:.2f} seconds")
    return results

def expensive_computation(item):
    """Simulate CPU-intensive work"""
    time.sleep(1)  # Represents complex calculation
    return item ** 2

# With 1000 items, this takes 1000 seconds (16+ minutes)
# large_data = list(range(1000))
# results = process_large_dataset(large_data)
```

**The Fundamental Problem:**

* Single CPU core can only do one thing at a time
* Memory limitations on single machines
* Network bandwidth constraints
* Single points of failure

> **Mental Model** : Think of cooking a large meal alone vs. with a team of chefs. One chef (single computer) can only chop vegetables OR cook meat OR prepare sauce at any given moment. Multiple chefs (distributed computing) can work simultaneously on different tasks.

## 2. Parallelism vs. Concurrency vs. Distribution

Let's clarify these often-confused concepts:

```
Single Core Timeline:
Task A: |████████|
Task B:           |████████|
Task C:                     |████████|
Time:   0--------8--------16--------24

Concurrent (Single Core):
Task A: |██|  |██|  |██|
Task B:   |██|  |██|  |██|
Task C:     |██|  |██|  |██|
Time:   0--2--4--6--8--10--12

Parallel (Multi-Core):
Core 1: |████████|
Core 2: |████████|
Core 3: |████████|
Time:   0--------8

Distributed (Multiple Machines):
Machine 1: |████████|
Machine 2: |████████|
Machine 3: |████████|
Network:   |<-sync->|
Time:      0--------8
```

```python
import threading
import multiprocessing
import time

# Sequential Processing
def sequential_example():
    """Traditional approach - one task after another"""
    start = time.time()
  
    def task(n):
        time.sleep(1)  # Simulate work
        return n * n
  
    results = [task(i) for i in range(4)]
    print(f"Sequential: {time.time() - start:.2f}s, Results: {results}")

# Concurrent Processing (threading - good for I/O bound tasks)
def concurrent_example():
    """Multiple threads sharing CPU time"""
    import concurrent.futures
    start = time.time()
  
    def task(n):
        time.sleep(1)  # I/O simulation
        return n * n
  
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(task, range(4)))
  
    print(f"Concurrent: {time.time() - start:.2f}s, Results: {results}")

# Parallel Processing (multiprocessing - good for CPU bound tasks)
def parallel_example():
    """Multiple processes using multiple CPU cores"""
    start = time.time()
  
    def cpu_task(n):
        # CPU-intensive work (not just sleeping)
        total = 0
        for i in range(1000000):
            total += i * n
        return total
  
    with multiprocessing.Pool(processes=4) as pool:
        results = pool.map(cpu_task, range(4))
  
    print(f"Parallel: {time.time() - start:.2f}s")

# Run examples to see the difference
if __name__ == "__main__":
    sequential_example()    # ~4 seconds
    concurrent_example()    # ~1 second (I/O bound)
    parallel_example()      # Uses multiple CPU cores
```

> **Key Distinction** :
>
> * **Concurrency** : Managing multiple tasks at once (time-slicing)
> * **Parallelism** : Doing multiple tasks simultaneously (multiple cores)
> * **Distribution** : Coordinating work across multiple machines

## 3. Why Distributed Computing?

Understanding the motivations helps us design better systems:

```python
# Problem scenarios that require distributed solutions

class ComputationalChallenges:
    """Examples of problems that outgrow single machines"""
  
    def big_data_processing(self):
        """Data too large for single machine memory"""
        # Example: Processing 100TB of log files
        # Single machine: Might have 64GB RAM - impossible to load all data
        # Distributed: Spread data across 100 machines, each handles 1TB
        pass
  
    def cpu_intensive_tasks(self):
        """Computation too slow for single machine"""
        # Example: Training deep learning models
        # Single GPU: Might take 30 days
        # 100 GPUs distributed: Could take 7 hours
        pass
  
    def high_availability_requirements(self):
        """Cannot afford single points of failure"""
        # Example: Banking systems, medical devices
        # Single machine: If it fails, entire system down
        # Distributed: Redundancy ensures continued operation
        pass
  
    def geographical_distribution(self):
        """Users distributed globally"""
        # Example: CDN (Content Delivery Network)
        # Single server in USA: European users experience high latency
        # Distributed: Servers in each region serve local users
        pass
```

> **Distributed Computing Definition** : A system where components located on networked computers communicate and coordinate their actions by passing messages, creating the illusion of a single coherent system.

## 4. Python's Role in Distributed Computing

Python's strengths and challenges in distributed systems:

**Python's Advantages:**

```python
# 1. Simple, readable syntax for complex coordination logic
def distribute_work(tasks, workers):
    """Python's readability shines in complex orchestration"""
    for worker_id, worker in enumerate(workers):
        # Assign tasks to workers based on their capabilities
        assigned_tasks = [task for i, task in enumerate(tasks) 
                         if i % len(workers) == worker_id]
        worker.assign_tasks(assigned_tasks)

# 2. Rich ecosystem of distributed computing libraries
# - mpi4py: MPI bindings
# - dask: Parallel computing
# - celery: Task queues
# - ray: Distributed ML
# - multiprocessing: Built-in parallel processing

# 3. Excellent data handling libraries
import pandas as pd
import numpy as np
# Perfect for data-intensive distributed applications
```

**Python's Challenges:**

```python
# 1. Global Interpreter Lock (GIL) limits true parallelism
import threading
import time

def gil_demonstration():
    """Shows how GIL affects CPU-bound tasks"""
  
    def cpu_bound_task():
        # This won't truly run in parallel due to GIL
        total = 0
        for i in range(10_000_000):
            total += i * i
        return total
  
    # Multiple threads won't help with CPU-bound work
    start = time.time()
    threads = []
    for _ in range(4):
        t = threading.Thread(target=cpu_bound_task)
        threads.append(t)
        t.start()
  
    for t in threads:
        t.join()
  
    print(f"Threading (GIL limited): {time.time() - start:.2f}s")

# 2. Performance considerations
# Python is interpreted, so raw computation can be slower
# Solution: Use C extensions, NumPy, or distribute to overcome this
```

> **Python's Sweet Spot** : Orchestrating distributed systems, data processing pipelines, and machine learning workloads where development speed and ecosystem richness matter more than raw single-threaded performance.

## 5. Introduction to MPI (Message Passing Interface)

MPI is the de facto standard for distributed parallel computing:

```
MPI Mental Model:

Process 0    Process 1    Process 2    Process 3
┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│Task A│    │Task B│    │Task C│    │Task D│
│      │    │      │    │      │    │      │
└──┬───┘    └──┬───┘    └──┬───┘    └──┬───┘
   │           │           │           │
   └───────────┼───────────┼───────────┘
               │           │
          Communication Network
```

### Installing and Basic Setup

```bash
# Install MPI implementation (Ubuntu/Debian)
sudo apt-get install mpich

# Install Python MPI bindings
pip install mpi4py

# Install on macOS
brew install mpich
pip install mpi4py
```

### Your First MPI Program

```python
# hello_mpi.py - Basic MPI concepts
from mpi4py import MPI

def basic_mpi_demo():
    """Demonstrates fundamental MPI concepts"""
  
    # Get the communicator (group of all processes)
    comm = MPI.COMM_WORLD
  
    # Get this process's rank (ID number)
    rank = comm.Get_rank()
  
    # Get total number of processes
    size = comm.Get_size()
  
    # Each process executes this code independently
    print(f"Hello from process {rank} of {size}")
  
    # Demonstrate point-to-point communication
    if rank == 0:
        # Process 0 sends data to process 1
        data = "Hello from process 0!"
        comm.send(data, dest=1, tag=11)
        print(f"Process {rank} sent: {data}")
  
    elif rank == 1:
        # Process 1 receives data from process 0
        data = comm.recv(source=0, tag=11)
        print(f"Process {rank} received: {data}")

if __name__ == "__main__":
    basic_mpi_demo()
```

```bash
# Run with 4 processes
mpirun -n 4 python hello_mpi.py

# Output:
# Hello from process 0 of 4
# Hello from process 1 of 4
# Hello from process 2 of 4
# Hello from process 3 of 4
# Process 0 sent: Hello from process 0!
# Process 1 received: Hello from process 0!
```

> **MPI Core Concepts** :
>
> * **Communicator** : Group of processes that can communicate
> * **Rank** : Unique identifier for each process (0 to size-1)
> * **Message Passing** : Explicit communication between processes
> * **SPMD** : Single Program, Multiple Data - same code runs on all processes

## 6. MPI Communication Patterns

### Point-to-Point Communication

```python
# point_to_point.py - Direct communication between two processes
from mpi4py import MPI
import numpy as np

def demonstrate_send_recv():
    """Basic send/receive operations"""
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    size = comm.Get_size()
  
    if size < 2:
        print("Need at least 2 processes!")
        return
  
    if rank == 0:
        # Sender process
        data = {
            'message': 'Hello World',
            'array': np.array([1, 2, 3, 4, 5]),
            'number': 42
        }
      
        print(f"Process {rank} sending: {data}")
        comm.send(data, dest=1, tag=0)
      
        # Receive response
        response = comm.recv(source=1, tag=1)
        print(f"Process {rank} received response: {response}")
  
    elif rank == 1:
        # Receiver process
        data = comm.recv(source=0, tag=0)
        print(f"Process {rank} received: {data}")
      
        # Process the data and send response
        response = {
            'processed': data['array'] * 2,
            'status': 'success'
        }
        comm.send(response, dest=0, tag=1)

def demonstrate_non_blocking():
    """Non-blocking communication for better performance"""
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
  
    if rank == 0:
        data = np.random.rand(1000)  # Large array
      
        # Start non-blocking send
        req = comm.isend(data, dest=1, tag=0)
      
        # Do other work while communication happens
        print("Process 0: Doing other work while sending...")
        other_work = np.sum(np.random.rand(1000))
      
        # Wait for send to complete
        req.wait()
        print(f"Process 0: Send completed, other work result: {other_work}")
  
    elif rank == 1:
        # Non-blocking receive
        req = comm.irecv(source=0, tag=0)
      
        # Do other work
        print("Process 1: Doing other work while receiving...")
        other_work = np.prod(np.random.rand(10))
      
        # Wait for data to arrive
        data = req.wait()
        print(f"Process 1: Received {len(data)} elements, other work: {other_work}")

if __name__ == "__main__":
    demonstrate_send_recv()
    print("\n--- Non-blocking Communication ---")
    demonstrate_non_blocking()
```

### Collective Communication

```python
# collective_ops.py - All processes participate simultaneously
from mpi4py import MPI
import numpy as np

def demonstrate_broadcast():
    """One-to-many communication"""
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
  
    if rank == 0:
        # Root process has the data
        data = {
            'config': {'batch_size': 32, 'learning_rate': 0.01},
            'model_weights': np.random.rand(100)
        }
        print(f"Process {rank} broadcasting: {list(data.keys())}")
    else:
        data = None
  
    # Broadcast from process 0 to all others
    data = comm.bcast(data, root=0)
  
    print(f"Process {rank} received broadcast data with keys: {list(data.keys())}")

def demonstrate_scatter_gather():
    """Distribute work and collect results"""
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    size = comm.Get_size()
  
    if rank == 0:
        # Prepare data to distribute
        total_data = list(range(20))  # 20 numbers to process
      
        # Split data into chunks for each process
        chunk_size = len(total_data) // size
        chunks = [total_data[i:i + chunk_size] 
                 for i in range(0, len(total_data), chunk_size)]
      
        # Ensure we have exactly 'size' chunks
        while len(chunks) < size:
            chunks.append([])
      
        print(f"Process {rank} scattering chunks: {chunks}")
    else:
        chunks = None
  
    # Scatter: distribute chunks to all processes
    local_data = comm.scatter(chunks, root=0)
    print(f"Process {rank} received chunk: {local_data}")
  
    # Each process works on its chunk
    local_result = [x ** 2 for x in local_data]  # Square each number
    print(f"Process {rank} computed: {local_result}")
  
    # Gather: collect results from all processes
    all_results = comm.gather(local_result, root=0)
  
    if rank == 0:
        # Flatten the results
        final_result = [item for sublist in all_results for item in sublist]
        print(f"Process {rank} gathered final results: {final_result}")

def demonstrate_reduce():
    """Combine data from all processes"""
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
  
    # Each process has some data to contribute
    local_data = np.array([rank + 1] * 5)  # [1,1,1,1,1], [2,2,2,2,2], etc.
    print(f"Process {rank} contributing: {local_data}")
  
    # Sum all arrays element-wise
    total_sum = comm.reduce(local_data, op=MPI.SUM, root=0)
  
    if rank == 0:
        print(f"Process {rank} - Final sum: {total_sum}")
  
    # All-reduce: every process gets the result
    total_sum_all = comm.allreduce(local_data, op=MPI.SUM)
    print(f"Process {rank} - Allreduce result: {total_sum_all}")

if __name__ == "__main__":
    print("=== Broadcast Demo ===")
    demonstrate_broadcast()
  
    print("\n=== Scatter/Gather Demo ===")
    demonstrate_scatter_gather()
  
    print("\n=== Reduce Demo ===")
    demonstrate_reduce()
```

```
Collective Communication Patterns:

Broadcast (1-to-N):
Root → [Data] → Process 1
     → [Data] → Process 2  
     → [Data] → Process 3

Scatter (1-to-N, different data):
Root → [Chunk1] → Process 1
     → [Chunk2] → Process 2
     → [Chunk3] → Process 3

Gather (N-to-1):
Process 1 → [Result1] ↘
Process 2 → [Result2] → Root
Process 3 → [Result3] ↗

Reduce (N-to-1, combined):
Process 1 → [Data1] ↘
Process 2 → [Data2] → Root (Sum/Max/Min/etc.)
Process 3 → [Data3] ↗
```

## 7. Real-World MPI Example: Distributed Monte Carlo

Let's solve a practical problem using MPI:

```python
# monte_carlo_pi.py - Estimate π using distributed random sampling
from mpi4py import MPI
import numpy as np
import time

def estimate_pi_serial(n_samples):
    """Serial version for comparison"""
    count = 0
    for _ in range(n_samples):
        x, y = np.random.random(), np.random.random()
        if x*x + y*y <= 1.0:
            count += 1
    return 4.0 * count / n_samples

def estimate_pi_parallel():
    """Distributed Monte Carlo estimation of π"""
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    size = comm.Get_size()
  
    # Total number of samples
    total_samples = 10_000_000
  
    # Each process handles a portion
    local_samples = total_samples // size
  
    print(f"Process {rank}: Computing with {local_samples} samples")
  
    # Start timing
    start_time = time.time()
  
    # Monte Carlo sampling
    # Generate random points in unit square
    x = np.random.random(local_samples)
    y = np.random.random(local_samples)
  
    # Count points inside unit circle
    inside_circle = np.sum((x*x + y*y) <= 1.0)
  
    print(f"Process {rank}: {inside_circle} points inside circle")
  
    # Gather results from all processes
    total_inside = comm.reduce(inside_circle, op=MPI.SUM, root=0)
  
    # Calculate π estimate
    if rank == 0:
        pi_estimate = 4.0 * total_inside / total_samples
        elapsed_time = time.time() - start_time
      
        print(f"\n=== Results ===")
        print(f"Total samples: {total_samples:,}")
        print(f"Points inside circle: {total_inside:,}")
        print(f"π estimate: {pi_estimate:.6f}")
        print(f"Actual π: {np.pi:.6f}")
        print(f"Error: {abs(pi_estimate - np.pi):.6f}")
        print(f"Time (parallel): {elapsed_time:.3f} seconds")
        print(f"Using {size} processes")
      
        # Compare with serial version (smaller sample for speed)
        serial_start = time.time()
        serial_pi = estimate_pi_serial(total_samples // size)  # Fair comparison
        serial_time = time.time() - serial_start
      
        print(f"Time (serial, {total_samples//size:,} samples): {serial_time:.3f} seconds")
        print(f"Speedup: {serial_time / elapsed_time:.2f}x")

if __name__ == "__main__":
    estimate_pi_parallel()
```

```bash
# Run with different numbers of processes
mpirun -n 1 python monte_carlo_pi.py   # Serial equivalent
mpirun -n 4 python monte_carlo_pi.py   # 4 processes
mpirun -n 8 python monte_carlo_pi.py   # 8 processes
```

> **Monte Carlo Method** : Uses random sampling to solve problems that might be deterministic in principle. Perfect for distributed computing because each process can work independently on random samples.

## 8. Cluster Computing Optimization

### Understanding Cluster Architecture

```
Typical Cluster Setup:

Head Node (Master)
┌─────────────────┐
│   Job Scheduler │ ← Submit jobs here
│   (SLURM/PBS)   │
│   File System   │
└─────────────────┘
         │
    Network Switch
         │
┌────────┼────────┬────────┐
│        │        │        │
Compute Node 1   Node 2   Node 3
┌──────────┐  ┌──────────┐  ┌──────────┐
│CPU CPU   │  │CPU CPU   │  │CPU CPU   │
│Memory    │  │Memory    │  │Memory    │
│Local SSD │  │Local SSD │  │Local SSD │
└──────────┘  └──────────┘  └──────────┘
```

### Optimization Strategies

```python
# cluster_optimization.py - Best practices for cluster computing
from mpi4py import MPI
import numpy as np
import time
import psutil
import os

class ClusterOptimizer:
    """Demonstrates cluster computing optimization techniques"""
  
    def __init__(self):
        self.comm = MPI.COMM_WORLD
        self.rank = self.comm.Get_rank()
        self.size = self.comm.Get_size()
  
    def cpu_affinity_optimization(self):
        """Bind processes to specific CPU cores"""
        # Get system information
        cpu_count = psutil.cpu_count(logical=False)  # Physical cores
        logical_count = psutil.cpu_count(logical=True)  # Including hyperthreading
      
        # Bind to specific core to avoid context switching
        core_id = self.rank % cpu_count
        os.sched_setaffinity(0, {core_id})
      
        print(f"Process {self.rank} bound to CPU core {core_id}")
      
        # Verify binding
        current_affinity = os.sched_getaffinity(0)
        print(f"Process {self.rank} actual affinity: {current_affinity}")
  
    def memory_optimization(self):
        """Optimize memory usage patterns"""
        # Check available memory
        memory = psutil.virtual_memory()
        print(f"Process {self.rank}: Available memory: {memory.available // (1024**3)} GB")
      
        # Calculate optimal chunk size based on available memory
        available_gb = memory.available // (1024**3)
        optimal_chunk_size = min(available_gb * 100_000_000, 1_000_000_000)  # Conservative estimate
      
        print(f"Process {self.rank}: Using chunk size: {optimal_chunk_size:,}")
      
        return optimal_chunk_size
  
    def io_optimization(self):
        """Optimize I/O operations"""
        # Use local storage when possible
        local_temp_dir = f"/tmp/process_{self.rank}"
        os.makedirs(local_temp_dir, exist_ok=True)
      
        # Example: Write intermediate results locally, then aggregate
        local_file = f"{local_temp_dir}/intermediate_data.npy"
      
        # Generate some data
        data = np.random.rand(1000, 1000)
      
        # Write to local storage first (fast)
        np.save(local_file, data)
      
        # Synchronize all processes
        self.comm.barrier()
      
        # Only root process aggregates to shared storage
        if self.rank == 0:
            print("Aggregating results to shared storage...")
            # This would copy from all local storages to shared NFS/Lustre
      
        # Cleanup local files
        os.remove(local_file)
        os.rmdir(local_temp_dir)
  
    def communication_optimization(self):
        """Optimize MPI communication patterns"""
        # Minimize communication overhead
      
        # Bad: Many small messages
        start_time = time.time()
        for i in range(100):
            if self.rank == 0:
                small_data = np.array([i])
                self.comm.bcast(small_data, root=0)
        bad_time = time.time() - start_time
      
        # Good: Fewer large messages
        start_time = time.time()
        if self.rank == 0:
            large_data = np.arange(100)
        else:
            large_data = None
      
        large_data = self.comm.bcast(large_data, root=0)
        good_time = time.time() - start_time
      
        if self.rank == 0:
            print(f"Many small messages: {bad_time:.4f}s")
            print(f"One large message: {good_time:.4f}s")
            print(f"Improvement: {bad_time / good_time:.2f}x faster")
  
    def load_balancing(self):
        """Demonstrate dynamic load balancing"""
        # Simulate different computational loads per process
        base_work = 1000000
      
        # Some processes get more work (simulating real-world imbalance)
        if self.rank == 0:
            work_multiplier = 3  # Process 0 gets 3x work
        elif self.rank == 1:
            work_multiplier = 2  # Process 1 gets 2x work
        else:
            work_multiplier = 1  # Other processes get normal work
      
        local_work = base_work * work_multiplier
      
        print(f"Process {self.rank}: Assigned {local_work:,} work units")
      
        # Measure work time
        start_time = time.time()
      
        # Simulate computational work
        result = 0
        for i in range(local_work):
            result += i * 0.001
      
        work_time = time.time() - start_time
        print(f"Process {self.rank}: Completed work in {work_time:.3f}s")
      
        # Gather timing information
        all_times = self.comm.gather(work_time, root=0)
      
        if self.rank == 0:
            print(f"\nLoad Balance Analysis:")
            print(f"Work times: {[f'{t:.3f}s' for t in all_times]}")
            print(f"Load imbalance: {max(all_times) - min(all_times):.3f}s")
            print(f"Efficiency: {min(all_times) / max(all_times) * 100:.1f}%")

def run_optimization_demo():
    """Run all optimization demonstrations"""
    optimizer = ClusterOptimizer()
  
    print(f"=== Process {optimizer.rank} Optimization Demo ===\n")
  
    print("1. CPU Affinity Optimization:")
    optimizer.cpu_affinity_optimization()
  
    print("\n2. Memory Optimization:")
    optimizer.memory_optimization()
  
    print("\n3. I/O Optimization:")
    optimizer.io_optimization()
  
    print("\n4. Communication Optimization:")
    optimizer.communication_optimization()
  
    print("\n5. Load Balancing Analysis:")
    optimizer.load_balancing()

if __name__ == "__main__":
    run_optimization_demo()
```

> **Cluster Computing Optimization Principles** :
>
> 1. **Minimize Communication** : Network is usually the bottleneck
> 2. **Balance Load** : Idle processes waste resources
> 3. **Use Local Storage** : Avoid shared filesystem when possible
> 4. **CPU Affinity** : Reduce context switching overhead
> 5. **Memory Locality** : Keep data close to computation

## 9. Network Communication Patterns

### Understanding Network Topologies

```python
# network_patterns.py - Communication topology optimization
from mpi4py import MPI
import numpy as np
import time
import math

class NetworkTopologies:
    """Demonstrates different communication topologies"""
  
    def __init__(self):
        self.comm = MPI.COMM_WORLD
        self.rank = self.comm.Get_rank()
        self.size = self.comm.Get_size()
  
    def ring_topology(self):
        """Each process communicates with neighbors in a ring"""
        # Ring: 0 ↔ 1 ↔ 2 ↔ 3 ↔ 0
      
        left_neighbor = (self.rank - 1) % self.size
        right_neighbor = (self.rank + 1) % self.size
      
        print(f"Process {self.rank}: neighbors {left_neighbor} ← → {right_neighbor}")
      
        # Pass a token around the ring
        if self.rank == 0:
            # Start with token
            token = f"Token from {self.rank}"
            self.comm.send(token, dest=right_neighbor, tag=0)
            print(f"Process {self.rank}: Sent token to {right_neighbor}")
          
            # Receive token back after full circle
            final_token = self.comm.recv(source=left_neighbor, tag=0)
            print(f"Process {self.rank}: Received final token: {final_token}")
        else:
            # Receive token from left neighbor
            token = self.comm.recv(source=left_neighbor, tag=0)
            print(f"Process {self.rank}: Received token: {token}")
          
            # Modify token and pass to right neighbor
            modified_token = f"{token} → {self.rank}"
            self.comm.send(modified_token, dest=right_neighbor, tag=0)
            print(f"Process {self.rank}: Sent modified token to {right_neighbor}")
  
    def tree_topology(self):
        """Hierarchical communication pattern"""
        # Binary tree: Root=0, children of node i are 2i+1 and 2i+2
      
        def get_parent(rank):
            return (rank - 1) // 2 if rank > 0 else -1
      
        def get_children(rank, size):
            left_child = 2 * rank + 1
            right_child = 2 * rank + 2
            children = []
            if left_child < size:
                children.append(left_child)
            if right_child < size:
                children.append(right_child)
            return children
      
        parent = get_parent(self.rank)
        children = get_children(self.rank, self.size)
      
        print(f"Process {self.rank}: parent={parent}, children={children}")
      
        # Tree-based broadcast from root
        if self.rank == 0:
            # Root broadcasts to children
            message = "Broadcast message from root"
            for child in children:
                self.comm.send(message, dest=child, tag=1)
                print(f"Root sent to child {child}")
        else:
            # Receive from parent and forward to children
            message = self.comm.recv(source=parent, tag=1)
            print(f"Process {self.rank} received: {message}")
          
            # Forward to children
            for child in children:
                self.comm.send(message, dest=child, tag=1)
                print(f"Process {self.rank} forwarded to child {child}")
  
    def mesh_topology(self):
        """2D mesh communication pattern"""
        # Arrange processes in a 2D grid
      
        # Calculate grid dimensions
        grid_size = int(math.sqrt(self.size))
        if grid_size * grid_size != self.size:
            if self.rank == 0:
                print(f"Warning: {self.size} processes don't form perfect square")
            return
      
        # Calculate 2D coordinates
        row = self.rank // grid_size
        col = self.rank % grid_size
      
        # Find neighbors (up, down, left, right)
        neighbors = {}
        if row > 0:  # Up neighbor
            neighbors['up'] = (row - 1) * grid_size + col
        if row < grid_size - 1:  # Down neighbor
            neighbors['down'] = (row + 1) * grid_size + col
        if col > 0:  # Left neighbor
            neighbors['left'] = row * grid_size + (col - 1)
        if col < grid_size - 1:  # Right neighbor
            neighbors['right'] = row * grid_size + (col + 1)
      
        print(f"Process {self.rank} at ({row},{col}): neighbors {neighbors}")
      
        # Example: Heat diffusion simulation
        # Each cell exchanges heat with neighbors
        current_temp = float(self.rank)  # Initial temperature
      
        for iteration in range(3):
            neighbor_temps = []
          
            # Send temperature to all neighbors
            for direction, neighbor_rank in neighbors.items():
                self.comm.send(current_temp, dest=neighbor_rank, tag=iteration)
          
            # Receive temperatures from all neighbors
            for direction, neighbor_rank in neighbors.items():
                neighbor_temp = self.comm.recv(source=neighbor_rank, tag=iteration)
                neighbor_temps.append(neighbor_temp)
          
            # Update temperature (simple averaging)
            if neighbor_temps:
                new_temp = (current_temp + sum(neighbor_temps)) / (len(neighbor_temps) + 1)
                print(f"Process {self.rank} iteration {iteration}: {current_temp:.2f} → {new_temp:.2f}")
                current_temp = new_temp

def bandwidth_benchmark():
    """Measure network bandwidth between processes"""
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    size = comm.Get_size()
  
    if size < 2:
        print("Need at least 2 processes for bandwidth test")
        return
  
    # Test different message sizes
    message_sizes = [1024, 10240, 102400, 1024000]  # 1KB to 1MB
  
    if rank == 0:
        print("Message Size | Bandwidth (MB/s) | Latency (μs)")
        print("-" * 45)
  
    for msg_size in message_sizes:
        # Create test data
        data = np.random.bytes(msg_size)
      
        # Synchronize all processes
        comm.barrier()
      
        if rank == 0:
            # Send data multiple times for accurate measurement
            num_iterations = 100
            start_time = time.time()
          
            for _ in range(num_iterations):
                comm.send(data, dest=1, tag=0)
                # Wait for acknowledgment
                comm.recv(source=1, tag=1)
          
            total_time = time.time() - start_time
            avg_time = total_time / num_iterations
            bandwidth_mbps = (msg_size / (1024 * 1024)) / avg_time
            latency_us = avg_time * 1_000_000
          
            print(f"{msg_size:8} B   | {bandwidth_mbps:10.2f}   | {latency_us:8.2f}")
      
        elif rank == 1:
            # Receive data and send acknowledgment
            for _ in range(100):
                received_data = comm.recv(source=0, tag=0)
                comm.send("ack", dest=0, tag=1)

def run_network_patterns():
    """Demonstrate all network communication patterns"""
    patterns = NetworkTopologies()
  
    print("=== Ring Topology ===")
    patterns.ring_topology()
  
    # Synchronize before next demo
    patterns.comm.barrier()
  
    print("\n=== Tree Topology ===")
    patterns.tree_topology()
  
    patterns.comm.barrier()
  
    print("\n=== Mesh Topology ===")
    patterns.mesh_topology()
  
    patterns.comm.barrier()
  
    if patterns.rank == 0:
        print("\n=== Bandwidth Benchmark ===")
    bandwidth_benchmark()

if __name__ == "__main__":
    run_network_patterns()
```

```
Network Topology Visualizations:

Ring Topology (4 processes):
┌───┐    ┌───┐
│ 0 │────│ 1 │
│   │    │   │
└─┬─┘    └─┬─┘
  │        │
  │        │
┌─┴─┐    ┌─┴─┐
│ 3 │────│ 2 │
└───┘    └───┘

Tree Topology (7 processes):
      ┌───┐
      │ 0 │ (root)
      └─┬─┘
    ┌───┴───┐
  ┌─┴─┐   ┌─┴─┐
  │ 1 │   │ 2 │
  └─┬─┘   └─┬─┘
  ┌─┴─┐   ┌─┴─┬─┐
  │ 3 │   │ 5 │6│
  └───┘   └───┘ │
        ┌─┴─┐   │
        │ 4 │   │
        └───┘   │

2D Mesh Topology (9 processes):
┌───┬───┬───┐
│ 0 │ 1 │ 2 │
├───┼───┼───┤
│ 3 │ 4 │ 5 │
├───┼───┼───┤
│ 6 │ 7 │ 8 │
└───┴───┴───┘
```

> **Network Pattern Selection** :
>
> * **Ring** : Good for sequential operations, token passing
> * **Tree** : Efficient for broadcasts, reductions
> * **Mesh** : Ideal for scientific simulations with spatial locality
> * **All-to-All** : High bandwidth utilization but expensive

## 10. Advanced Distributed Patterns

### Fault Tolerance and Recovery

```python
# fault_tolerance.py - Handling failures in distributed systems
from mpi4py import MPI
import numpy as np
import time
import random
import signal
import sys

class FaultTolerantSystem:
    """Demonstrates fault tolerance patterns"""
  
    def __init__(self):
        self.comm = MPI.COMM_WORLD
        self.rank = self.comm.Get_rank()
        self.size = self.comm.Get_size()
        self.checkpoint_interval = 10
        self.checkpoint_data = {}
  
    def simulate_random_failure(self, failure_probability=0.1):
        """Randomly simulate process failures"""
        if random.random() < failure_probability:
            print(f"Process {self.rank}: SIMULATED FAILURE!")
            # In real scenario, this would be a crash
            # For demo, we'll just return False
            return False
        return True
  
    def checkpoint_state(self, iteration, data):
        """Save current state for recovery"""
        self.checkpoint_data[iteration] = {
            'data': data.copy(),
            'timestamp': time.time(),
            'iteration': iteration
        }
      
        # Keep only recent checkpoints (memory management)
        if len(self.checkpoint_data) > 5:
            oldest_key = min(self.checkpoint_data.keys())
            del self.checkpoint_data[oldest_key]
      
        print(f"Process {self.rank}: Checkpointed at iteration {iteration}")
  
    def recover_from_checkpoint(self):
        """Recover from the latest checkpoint"""
        if not self.checkpoint_data:
            print(f"Process {self.rank}: No checkpoint found, starting fresh")
            return 0, np.random.rand(100)
      
        latest_iteration = max(self.checkpoint_data.keys())
        checkpoint = self.checkpoint_data[latest_iteration]
      
        print(f"Process {self.rank}: Recovered from iteration {latest_iteration}")
        return checkpoint['iteration'], checkpoint['data']
  
    def fault_tolerant_computation(self):
        """Main computation with fault tolerance"""
        max_iterations = 50
      
        # Try to recover from checkpoint
        start_iteration, data = self.recover_from_checkpoint()
      
        for iteration in range(start_iteration, max_iterations):
            # Simulate failure
            if not self.simulate_random_failure(0.05):  # 5% failure chance
                # Recover and continue
                iteration, data = self.recover_from_checkpoint()
                continue
          
            # Do some computation
            data = data * 0.99 + np.random.rand(len(data)) * 0.01
          
            # Checkpoint periodically
            if iteration % self.checkpoint_interval == 0:
                self.checkpoint_state(iteration, data)
          
            # Synchronize with other processes
            try:
                # Check if all processes are still alive
                self.comm.barrier()
              
                # Exchange data with neighbors
                if self.rank < self.size - 1:
                    self.comm.send(data[:10], dest=self.rank + 1, tag=iteration)
                if self.rank > 0:
                    neighbor_data = self.comm.recv(source=self.rank - 1, tag=iteration)
                    data[:10] = (data[:10] + neighbor_data) / 2
              
            except Exception as e:
                print(f"Process {self.rank}: Communication failed: {e}")
                # In real system, would trigger recovery protocol
                continue
          
            if iteration % 10 == 0:
                print(f"Process {self.rank}: Completed iteration {iteration}")
      
        print(f"Process {self.rank}: Computation completed successfully")

def redundant_computation():
    """Use redundancy to handle failures"""
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    size = comm.Get_size()
  
    # Group processes into redundant pairs
    group_size = 2
    group_id = rank // group_size
    local_rank = rank % group_size
  
    print(f"Process {rank}: Group {group_id}, Local rank {local_rank}")
  
    # Each group computes the same work
    group_work = np.arange(group_id * 1000, (group_id + 1) * 1000)
  
    # Compute result
    result = np.sum(group_work ** 2)
  
    # Cross-check with group partner
    if local_rank == 0:
        partner = rank + 1
        if partner < size:
            comm.send(result, dest=partner, tag=0)
            partner_result = comm.recv(source=partner, tag=1)
          
            if abs(result - partner_result) < 1e-10:
                print(f"Group {group_id}: Results match - {result}")
            else:
                print(f"Group {group_id}: MISMATCH! {result} vs {partner_result}")
    else:
        partner = rank - 1
        partner_result = comm.recv(source=partner, tag=0)
        comm.send(result, dest=partner, tag=1)

if __name__ == "__main__":
    print("=== Fault Tolerant System Demo ===")
  
    ft_system = FaultTolerantSystem()
    ft_system.fault_tolerant_computation()
  
    print("\n=== Redundant Computation Demo ===")
    redundant_computation()
```

### Load Balancing and Work Stealing

```python
# work_stealing.py - Dynamic load balancing
from mpi4py import MPI
import numpy as np
import time
import queue
import threading

class WorkStealingScheduler:
    """Implements work stealing for dynamic load balancing"""
  
    def __init__(self):
        self.comm = MPI.COMM_WORLD
        self.rank = self.comm.Get_rank()
        self.size = self.comm.Get_size()
        self.work_queue = queue.Queue()
        self.completed_work = []
        self.total_work_done = 0
  
    def generate_work(self, total_tasks=1000):
        """Generate work items with varying computational cost"""
        if self.rank == 0:
            # Create tasks with different complexities
            tasks = []
            for i in range(total_tasks):
                # Some tasks are much more expensive than others
                complexity = np.random.choice([1, 5, 10, 20], p=[0.7, 0.2, 0.08, 0.02])
                tasks.append({
                    'id': i,
                    'complexity': complexity,
                    'data': np.random.rand(complexity * 100)
                })
          
            print(f"Generated {len(tasks)} tasks with varying complexity")
            return tasks
        return []
  
    def distribute_initial_work(self, tasks):
        """Distribute work evenly initially"""
        if self.rank == 0:
            # Split tasks among all processes
            chunk_size = len(tasks) // self.size
            for dest_rank in range(self.size):
                start_idx = dest_rank * chunk_size
                if dest_rank == self.size - 1:
                    # Last process gets remaining tasks
                    chunk = tasks[start_idx:]
                else:
                    chunk = tasks[start_idx:start_idx + chunk_size]
              
                if dest_rank == 0:
                    # Add to own queue
                    for task in chunk:
                        self.work_queue.put(task)
                else:
                    # Send to other processes
                    self.comm.send(chunk, dest=dest_rank, tag=0)
              
                print(f"Sent {len(chunk)} tasks to process {dest_rank}")
        else:
            # Receive initial work
            chunk = self.comm.recv(source=0, tag=0)
            for task in chunk:
                self.work_queue.put(task)
            print(f"Process {self.rank}: Received {len(chunk)} initial tasks")
  
    def process_task(self, task):
        """Process a single work item"""
        # Simulate computation time based on complexity
        complexity = task['complexity']
        data = task['data']
      
        # Do some actual computation
        result = np.sum(data ** 2) * complexity
      
        # Simulate processing time
        time.sleep(complexity * 0.01)  # Higher complexity = more time
      
        return {
            'task_id': task['id'],
            'result': result,
            'complexity': complexity
        }
  
    def steal_work(self):
        """Try to steal work from other processes"""
        # Try to steal from a random process
        victim = np.random.randint(0, self.size)
        if victim == self.rank:
            return None
      
        # Send work steal request
        self.comm.send("STEAL_REQUEST", dest=victim, tag=1)
      
        # Check for response
        if self.comm.iprobe(source=victim, tag=2):
            stolen_tasks = self.comm.recv(source=victim, tag=2)
            if stolen_tasks:
                print(f"Process {self.rank}: Stole {len(stolen_tasks)} tasks from {victim}")
                return stolen_tasks
      
        return None
  
    def handle_steal_requests(self):
        """Handle work steal requests from other processes"""
        # Check for steal requests
        while self.comm.iprobe(source=MPI.ANY_SOURCE, tag=1):
            request = self.comm.recv(source=MPI.ANY_SOURCE, tag=1)
            requester = request  # In real implementation, would parse request
          
            # Give away half of remaining work
            if self.work_queue.qsize() > 1:
                tasks_to_give = []
                give_count = self.work_queue.qsize() // 2
              
                for _ in range(give_count):
                    if not self.work_queue.empty():
                        tasks_to_give.append(self.work_queue.get())
              
                # Send tasks to requester
                self.comm.send(tasks_to_give, dest=requester, tag=2)
                print(f"Process {self.rank}: Gave {len(tasks_to_give)} tasks to {requester}")
            else:
                # No work to give
                self.comm.send([], dest=requester, tag=2)
  
    def work_stealing_loop(self):
        """Main work processing loop with stealing"""
        start_time = time.time()
        idle_time = 0
      
        while True:
            # Handle steal requests from others
            self.handle_steal_requests()
          
            # Try to get work from own queue
            if not self.work_queue.empty():
                task = self.work_queue.get()
                result = self.process_task(task)
                self.completed_work.append(result)
                self.total_work_done += 1
              
                if self.total_work_done % 10 == 0:
                    print(f"Process {self.rank}: Completed {self.total_work_done} tasks")
          
            else:
                # No work available, try to steal
                idle_start = time.time()
                stolen_tasks = self.steal_work()
              
                if stolen_tasks:
                    for task in stolen_tasks:
                        self.work_queue.put(task)
                else:
                    idle_time += time.time() - idle_start
                    time.sleep(0.01)  # Small delay to avoid busy waiting
              
                # Check if all processes are done
                all_done = self.comm.allreduce(self.work_queue.empty(), op=MPI.LAND)
                if all_done:
                    break
      
        total_time = time.time() - start_time
        efficiency = (total_time - idle_time) / total_time * 100
      
        print(f"Process {self.rank}: Completed {self.total_work_done} tasks")
        print(f"Process {self.rank}: Efficiency: {efficiency:.1f}% (idle: {idle_time:.2f}s)")
      
        return self.completed_work

def run_work_stealing_demo():
    """Demonstrate work stealing load balancing"""
    scheduler = WorkStealingScheduler()
  
    # Generate and distribute work
    tasks = scheduler.generate_work(200)
    scheduler.distribute_initial_work(tasks)
  
    # Process work with stealing
    results = scheduler.work_stealing_loop()
  
    # Gather final statistics
    all_work_counts = scheduler.comm.gather(scheduler.total_work_done, root=0)
  
    if scheduler.rank == 0:
        print(f"\n=== Final Work Distribution ===")
        for i, count in enumerate(all_work_counts):
            print(f"Process {i}: {count} tasks completed")
      
        total_completed = sum(all_work_counts)
        print(f"Total tasks completed: {total_completed}")
      
        # Calculate load balance
        mean_work = np.mean(all_work_counts)
        std_work = np.std(all_work_counts)
        balance_factor = std_work / mean_work if mean_work > 0 else 0
      
        print(f"Load balance factor: {balance_factor:.3f} (lower is better)")

if __name__ == "__main__":
    run_work_stealing_demo()
```

## 11. Integration with Modern Python Ecosystems

### Using MPI with Scientific Python

```python
# scientific_mpi.py - MPI with NumPy, SciPy, and ML libraries
from mpi4py import MPI
import numpy as np
import time

# Conditional imports for availability
try:
    import scipy.sparse as sp
    from scipy.linalg import norm
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False

try:
    import sklearn.datasets as datasets
    from sklearn.linear_model import LinearRegression
    from sklearn.model_selection import train_test_split
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

class DistributedScientificComputing:
    """Integration with scientific Python ecosystem"""
  
    def __init__(self):
        self.comm = MPI.COMM_WORLD
        self.rank = self.comm.Get_rank()
        self.size = self.comm.Get_size()
  
    def distributed_linear_algebra(self):
        """Distributed matrix operations"""
        # Generate distributed matrix
        local_rows = 1000
        cols = 500
      
        # Each process generates part of a large matrix
        local_matrix = np.random.rand(local_rows, cols)
        local_vector = np.random.rand(cols)
      
        print(f"Process {self.rank}: Local matrix shape {local_matrix.shape}")
      
        # Distribute vector to all processes
        vector = self.comm.bcast(local_vector if self.rank == 0 else None, root=0)
      
        # Parallel matrix-vector multiplication
        start_time = time.time()
        local_result = np.dot(local_matrix, vector)
      
        # Gather results
        all_results = self.comm.gather(local_result, root=0)
      
        if self.rank == 0:
            final_result = np.concatenate(all_results)
            print(f"Distributed matrix-vector multiply: {time.time() - start_time:.3f}s")
            print(f"Result shape: {final_result.shape}")
  
    def distributed_machine_learning(self):
        """Distributed machine learning with sklearn"""
        if not SKLEARN_AVAILABLE:
            if self.rank == 0:
                print("Scikit-learn not available, skipping ML demo")
            return
      
        # Generate dataset on root process
        if self.rank == 0:
            # Create a large synthetic dataset
            X, y = datasets.make_regression(
                n_samples=10000, 
                n_features=100, 
                noise=0.1, 
                random_state=42
            )
          
            # Split data for distribution
            chunk_size = len(X) // self.size
            data_chunks = []
            label_chunks = []
          
            for i in range(self.size):
                start_idx = i * chunk_size
                if i == self.size - 1:
                    # Last process gets remaining data
                    data_chunks.append(X[start_idx:])
                    label_chunks.append(y[start_idx:])
                else:
                    data_chunks.append(X[start_idx:start_idx + chunk_size])
                    label_chunks.append(y[start_idx:start_idx + chunk_size])
          
            print(f"Created dataset: {X.shape}, distributing to {self.size} processes")
        else:
            data_chunks = None
            label_chunks = None
      
        # Scatter data to all processes
        local_X = self.comm.scatter(data_chunks, root=0)
        local_y = self.comm.scatter(label_chunks, root=0)
      
        print(f"Process {self.rank}: Received {local_X.shape[0]} samples")
      
        # Each process trains on local data
        model = LinearRegression()
        model.fit(local_X, local_y)
      
        local_score = model.score(local_X, local_y)
        print(f"Process {self.rank}: Local R² score: {local_score:.4f}")
      
        # Gather model parameters for ensemble
        local_coef = model.coef_
        local_intercept = model.intercept_
      
        all_coefs = self.comm.gather(local_coef, root=0)
        all_intercepts = self.comm.gather(local_intercept, root=0)
      
        if self.rank == 0:
            # Average the models (simple ensemble)
            ensemble_coef = np.mean(all_coefs, axis=0)
            ensemble_intercept = np.mean(all_intercepts)
          
            print(f"Ensemble model created from {self.size} local models")
          
            # Test ensemble on full dataset
            X, y = datasets.make_regression(
                n_samples=1000, 
                n_features=100, 
                noise=0.1, 
                random_state=123  # Different test set
            )
          
            ensemble_predictions = X @ ensemble_coef + ensemble_intercept
            ensemble_score = 1 - np.sum((y - ensemble_predictions) ** 2) / np.sum((y - np.mean(y)) ** 2)
            print(f"Ensemble R² score on test data: {ensemble_score:.4f}")
  
    def distributed_sparse_operations(self):
        """Distributed sparse matrix operations"""
        if not SCIPY_AVAILABLE:
            if self.rank == 0:
                print("SciPy not available, skipping sparse demo")
            return
      
        # Create distributed sparse matrix
        local_size = 1000
        density = 0.01  # 1% non-zero elements
      
        # Each process creates a sparse matrix block
        local_sparse = sp.random(local_size, local_size, density=density, format='csr')
      
        print(f"Process {self.rank}: Sparse matrix {local_sparse.shape}, "
              f"{local_sparse.nnz} non-zeros ({local_sparse.nnz/local_sparse.size*100:.2f}% density)")
      
        # Sparse matrix-vector multiplication
        vector = np.random.rand(local_size)
        result = local_sparse.dot(vector)
      
        # Gather statistics
        local_nnz = local_sparse.nnz
        total_nnz = self.comm.reduce(local_nnz, op=MPI.SUM, root=0)
      
        if self.rank == 0:
            print(f"Total non-zeros across all processes: {total_nnz:,}")
  
    def distributed_fft(self):
        """Distributed Fast Fourier Transform"""
        # Generate signal data
        N = 4096  # Total signal length
        local_N = N // self.size
      
        # Each process generates part of the signal
        t_local = np.linspace(
            self.rank * local_N / N, 
            (self.rank + 1) * local_N / N, 
            local_N, 
            endpoint=False
        )
      
        # Composite signal: sum of multiple frequencies
        frequency1, frequency2 = 50, 120  # Hz
        local_signal = (np.sin(2 * np.pi * frequency1 * t_local) + 
                       0.5 * np.sin(2 * np.pi * frequency2 * t_local) +
                       0.1 * np.random.randn(local_N))  # Add noise
      
        print(f"Process {self.rank}: Generated {local_N} signal samples")
      
        # Local FFT
        local_fft = np.fft.fft(local_signal)
      
        # For true distributed FFT, we'd need more complex all-to-all communication
        # This is a simplified version showing parallel processing
      
        # Gather frequency magnitudes for analysis
        local_magnitude = np.abs(local_fft)
        all_magnitudes = self.comm.gather(local_magnitude, root=0)
      
        if self.rank == 0:
            # Combine results
            full_magnitude = np.concatenate(all_magnitudes)
          
            # Find dominant frequencies
            freqs = np.fft.fftfreq(N, d=1/N)
            dominant_indices = np.argsort(full_magnitude)[-10:]  # Top 10 frequencies
          
            print("Top frequency components:")
            for idx in reversed(dominant_indices):
                if freqs[idx] >= 0:  # Only positive frequencies
                    print(f"  {freqs[idx]:.1f} Hz: magnitude {full_magnitude[idx]:.2f}")

def run_scientific_computing_demo():
    """Run all scientific computing demonstrations"""
    sci_comp = DistributedScientificComputing()
  
    print("=== Distributed Linear Algebra ===")
    sci_comp.distributed_linear_algebra()
  
    print("\n=== Distributed Machine Learning ===")
    sci_comp.distributed_machine_learning()
  
    print("\n=== Distributed Sparse Operations ===")
    sci_comp.distributed_sparse_operations()
  
    print("\n=== Distributed FFT ===")
    sci_comp.distributed_fft()

if __name__ == "__main__":
    run_scientific_computing_demo()
```

> **Best Practices for Scientific MPI** :
>
> 1. **Data Locality** : Keep related computations on same process
> 2. **Memory Efficiency** : Use views and slices instead of copies
> 3. **Numerical Stability** : Be aware of floating-point precision in reductions
> 4. **Library Integration** : Leverage NumPy's optimized routines
> 5. **Profiling** : Use MPI profiling tools to identify bottlenecks

## 12. Performance Monitoring and Debugging

```python
# mpi_profiling.py - Performance analysis and debugging
from mpi4py import MPI
import numpy as np
import time
import psutil
import traceback
import sys

class MPIProfiler:
    """Performance monitoring and debugging utilities"""
  
    def __init__(self):
        self.comm = MPI.COMM_WORLD
        self.rank = self.comm.Get_rank()
        self.size = self.comm.Get_size()
        self.timers = {}
        self.memory_snapshots = []
        self.communication_stats = {
            'sends': 0,
            'receives': 0,
            'bytes_sent': 0,
            'bytes_received': 0
        }
  
    def start_timer(self, name):
        """Start a named timer"""
        self.timers[name] = {'start': time.time(), 'total': 0}
  
    def stop_timer(self, name):
        """Stop a named timer"""
        if name in self.timers and 'start' in self.timers[name]:
            elapsed = time.time() - self.timers[name]['start']
            self.timers[name]['total'] += elapsed
            del self.timers[name]['start']
            return elapsed
        return 0
  
    def memory_snapshot(self, label):
        """Take a memory usage snapshot"""
        memory = psutil.virtual_memory()
        process = psutil.Process()
      
        snapshot = {
            'label': label,
            'timestamp': time.time(),
            'system_available': memory.available // (1024**2),  # MB
            'process_rss': process.memory_info().rss // (1024**2),  # MB
            'process_vms': process.memory_info().vms // (1024**2),  # MB
        }
      
        self.memory_snapshots.append(snapshot)
        return snapshot
  
    def profile_communication(self, operation, *args, **kwargs):
        """Profile MPI communication operations"""
        start_time = time.time()
      
        try:
            if operation == 'send':
                data = args[0]
                self.comm.send(data, **kwargs)
                self.communication_stats['sends'] += 1
                self.communication_stats['bytes_sent'] += sys.getsizeof(data)
          
            elif operation == 'recv':
                data = self.comm.recv(**kwargs)
                self.communication_stats['receives'] += 1
                self.communication_stats['bytes_received'] += sys.getsizeof(data)
                return data
          
            elif operation == 'bcast':
                data = self.comm.bcast(args[0] if args else None, **kwargs)
                if 'root' in kwargs and kwargs['root'] == self.rank:
                    self.communication_stats['sends'] += self.size - 1
                else:
                    self.communication_stats['receives'] += 1
                return data
          
            elif operation == 'gather':
                data = self.comm.gather(args[0], **kwargs)
                if 'root' in kwargs and kwargs['root'] == self.rank:
                    self.communication_stats['receives'] += self.size - 1
                else:
                    self.communication_stats['sends'] += 1
                return data
      
        except Exception as e:
            print(f"Process {self.rank}: Communication error in {operation}: {e}")
            traceback.print_exc()
            raise
      
        finally:
            comm_time = time.time() - start_time
            timer_name = f'comm_{operation}'
            if timer_name not in self.timers:
                self.timers[timer_name] = {'total': 0}
            self.timers[timer_name]['total'] += comm_time
  
    def generate_report(self):
        """Generate comprehensive performance report"""
        # Gather statistics from all processes
        all_timers = self.comm.gather(self.timers, root=0)
        all_comm_stats = self.comm.gather(self.communication_stats, root=0)
        all_memory = self.comm.gather(self.memory_snapshots, root=0)
      
        if self.rank == 0:
            print("=" * 60)
            print("MPI PERFORMANCE REPORT")
            print("=" * 60)
          
            # Timer analysis
            print("\n📊 TIMING ANALYSIS")
            print("-" * 30)
          
            # Aggregate timer data
            all_timer_names = set()
            for rank_timers in all_timers:
                all_timer_names.update(rank_timers.keys())
          
            for timer_name in sorted(all_timer_names):
                times = [rank_timers.get(timer_name, {}).get('total', 0) 
                        for rank_timers in all_timers]
              
                if any(t > 0 for t in times):
                    avg_time = np.mean(times)
                    max_time = np.max(times)
                    min_time = np.min(times)
                    std_time = np.std(times)
                  
                    print(f"{timer_name:20s}: avg={avg_time:.3f}s, "
                          f"max={max_time:.3f}s, std={std_time:.3f}s")
          
            # Communication analysis
            print("\n📡 COMMUNICATION ANALYSIS")
            print("-" * 30)
          
            total_sends = sum(stats['sends'] for stats in all_comm_stats)
            total_receives = sum(stats['receives'] for stats in all_comm_stats)
            total_bytes_sent = sum(stats['bytes_sent'] for stats in all_comm_stats)
            total_bytes_received = sum(stats['bytes_received'] for stats in all_comm_stats)
          
            print(f"Total sends: {total_sends:,}")
            print(f"Total receives: {total_receives:,}")
            print(f"Total bytes sent: {total_bytes_sent:,} ({total_bytes_sent/(1024**2):.1f} MB)")
            print(f"Total bytes received: {total_bytes_received:,} ({total_bytes_received/(1024**2):.1f} MB)")
          
            # Communication balance
            sends_per_process = [stats['sends'] for stats in all_comm_stats]
            comm_imbalance = np.std(sends_per_process) / np.mean(sends_per_process) if np.mean(sends_per_process) > 0 else 0
            print(f"Communication imbalance: {comm_imbalance:.3f} (lower is better)")
          
            # Memory analysis
            print("\n💾 MEMORY ANALYSIS")
            print("-" * 30)
          
            for rank, memory_snapshots in enumerate(all_memory):
                if memory_snapshots:
                    max_rss = max(snap['process_rss'] for snap in memory_snapshots)
                    print(f"Process {rank}: Peak memory usage: {max_rss} MB")

def profiling_demo():
    """Demonstrate profiling capabilities"""
    profiler = MPIProfiler()
  
    # Take initial memory snapshot
    profiler.memory_snapshot("initialization")
  
    # Simulate some computational work with profiling
    profiler.start_timer("data_generation")
  
    # Generate test data
    data_size = 10000
    local_data = np.random.rand(data_size)
  
    profiler.stop_timer("data_generation")
    profiler.memory_snapshot("after_data_generation")
  
    # Simulate communication with profiling
    profiler.start_timer("communication")
  
    if profiler.rank == 0:
        # Broadcast data
        broadcast_data = profiler.profile_communication('bcast', local_data, root=0)
      
        # Gather results
        results = profiler.profile_communication('gather', np.sum(local_data), root=0)
      
    else:
        # Receive broadcast
        broadcast_data = profiler.profile_communication('bcast', None, root=0)
      
        # Send result
        profiler.profile_communication('gather', np.sum(broadcast_data), root=0)
  
    profiler.stop_timer("communication")
    profiler.memory_snapshot("after_communication")
  
    # Simulate computational work
    profiler.start_timer("computation")
  
    # Some CPU-intensive work
    result = 0
    for i in range(1000000):
        result += np.sin(i * 0.001)
  
    profiler.stop_timer("computation")
    profiler.memory_snapshot("after_computation")
  
    # Generate and display report
    profiler.generate_report()

def debugging_demo():
    """Demonstrate debugging techniques"""
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    size = comm.Get_size()
  
    print(f"🐛 Debug Info - Process {rank}")
    print(f"   PID: {psutil.Process().pid}")
    print(f"   CPU cores available: {psutil.cpu_count()}")
    print(f"   Memory available: {psutil.virtual_memory().available // (1024**2)} MB")
  
    # Demonstrate synchronized debugging
    print(f"\n🔄 Synchronization check - Process {rank}")
  
    # Each process reports in order
    for i in range(size):
        if rank == i:
            print(f"Process {rank}: Ready for synchronization")
            sys.stdout.flush()  # Ensure output appears immediately
        comm.barrier()  # Wait for all processes to reach this point
  
    # Demonstrate deadlock detection
    print(f"\n⚠️  Deadlock prevention demo - Process {rank}")
  
    # Safe communication pattern
    if rank % 2 == 0:  # Even ranks send first
        if rank + 1 < size:
            comm.send(f"Message from {rank}", dest=rank + 1, tag=0)
            response = comm.recv(source=rank + 1, tag=1)
            print(f"Process {rank}: Received response: {response}")
    else:  # Odd ranks receive first
        message = comm.recv(source=rank - 1, tag=0)
        print(f"Process {rank}: Received: {message}")
        comm.send(f"Response from {rank}", dest=rank - 1, tag=1)

if __name__ == "__main__":
    print("=== MPI Profiling Demo ===")
    profiling_demo()
  
    print("\n=== MPI Debugging Demo ===")
    debugging_demo()
```

> **Common MPI Debugging Issues** :
>
> * **Deadlocks** : Processes waiting for each other indefinitely
> * **Race Conditions** : Non-deterministic behavior due to timing
> * **Memory Leaks** : Accumulated memory usage over time
> * **Load Imbalance** : Some processes finish much earlier than others
> * **Communication Bottlenecks** : Network saturation or poor patterns

## 13. Real-World Application: Distributed Deep Learning

```python
# distributed_ml.py - Practical distributed machine learning
from mpi4py import MPI
import numpy as np
import time

class DistributedNeuralNetwork:
    """Simple distributed neural network for demonstration"""
  
    def __init__(self, input_size, hidden_size, output_size, learning_rate=0.01):
        self.comm = MPI.COMM_WORLD
        self.rank = self.comm.Get_rank()
        self.size = self.comm.Get_size()
      
        # Initialize weights (same seed for consistency)
        np.random.seed(42)
        self.W1 = np.random.randn(input_size, hidden_size) * 0.1
        self.b1 = np.zeros((1, hidden_size))
        self.W2 = np.random.randn(hidden_size, output_size) * 0.1
        self.b2 = np.zeros((1, output_size))
      
        self.learning_rate = learning_rate
      
        print(f"Process {self.rank}: Initialized NN with {input_size}→{hidden_size}→{output_size}")
  
    def sigmoid(self, x):
        """Sigmoid activation function"""
        return 1 / (1 + np.exp(-np.clip(x, -250, 250)))  # Clip to prevent overflow
  
    def forward(self, X):
        """Forward pass"""
        self.z1 = np.dot(X, self.W1) + self.b1
        self.a1 = self.sigmoid(self.z1)
        self.z2 = np.dot(self.a1, self.W2) + self.b2
        self.a2 = self.sigmoid(self.z2)
        return self.a2
  
    def backward(self, X, y, output):
        """Backward pass - compute gradients"""
        m = X.shape[0]  # batch size
      
        # Output layer gradients
        dz2 = output - y
        dW2 = np.dot(self.a1.T, dz2) / m
        db2 = np.sum(dz2, axis=0, keepdims=True) / m
      
        # Hidden layer gradients
        da1 = np.dot(dz2, self.W2.T)
        dz1 = da1 * self.a1 * (1 - self.a1)
        dW1 = np.dot(X.T, dz1) / m
        db1 = np.sum(dz1, axis=0, keepdims=True) / m
      
        return dW1, db1, dW2, db2
  
    def compute_loss(self, y_true, y_pred):
        """Compute binary cross-entropy loss"""
        epsilon = 1e-15  # Prevent log(0)
        y_pred = np.clip(y_pred, epsilon, 1 - epsilon)
        return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))
  
    def parameter_server_update(self, local_gradients):
        """Parameter server approach - collect and average gradients"""
        dW1, db1, dW2, db2 = local_gradients
      
        # Gather gradients from all processes
        all_dW1 = self.comm.gather(dW1, root=0)
        all_db1 = self.comm.gather(db1, root=0)
        all_dW2 = self.comm.gather(dW2, root=0)
        all_db2 = self.comm.gather(db2, root=0)
      
        if self.rank == 0:
            # Average gradients
            avg_dW1 = np.mean(all_dW1, axis=0)
            avg_db1 = np.mean(all_db1, axis=0)
            avg_dW2 = np.mean(all_dW2, axis=0)
            avg_db2 = np.mean(all_db2, axis=0)
          
            # Update parameters
            self.W1 -= self.learning_rate * avg_dW1
            self.b1 -= self.learning_rate * avg_db1
            self.W2 -= self.learning_rate * avg_dW2
            self.b2 -= self.learning_rate * avg_db2
          
            # Broadcast updated parameters
            updated_params = (self.W1, self.b1, self.W2, self.b2)
        else:
            updated_params = None
      
        # All processes receive updated parameters
        self.W1, self.b1, self.W2, self.b2 = self.comm.bcast(updated_params, root=0)
  
    def allreduce_update(self, local_gradients):
        """AllReduce approach - more efficient for smaller clusters"""
        dW1, db1, dW2, db2 = local_gradients
      
        # Average gradients across all processes
        avg_dW1 = self.comm.allreduce(dW1, op=MPI.SUM) / self.size
        avg_db1 = self.comm.allreduce(db1, op=MPI.SUM) / self.size
        avg_dW2 = self.comm.allreduce(dW2, op=MPI.SUM) / self.size
        avg_db2 = self.comm.allreduce(db2, op=MPI.SUM) / self.size
      
        # Update parameters
        self.W1 -= self.learning_rate * avg_dW1
        self.b1 -= self.learning_rate * avg_db1
        self.W2 -= self.learning_rate * avg_dW2
        self.b2 -= self.learning_rate * avg_db2
  
    def train_distributed(self, X_train, y_train, epochs=100, batch_size=32, method='allreduce'):
        """Train the network using distributed data parallelism"""
        print(f"Process {self.rank}: Training with {len(X_train)} samples for {epochs} epochs")
      
        # Training loop
        for epoch in range(epochs):
            epoch_loss = 0
            num_batches = 0
          
            # Shuffle data (each process independently - creates diversity)
            indices = np.random.permutation(len(X_train))
            X_shuffled = X_train[indices]
            y_shuffled = y_train[indices]
          
            # Process mini-batches
            for i in range(0, len(X_train), batch_size):
                batch_X = X_shuffled[i:i + batch_size]
                batch_y = y_shuffled[i:i + batch_size]
              
                if len(batch_X) == 0:
                    continue
              
                # Forward pass
                output = self.forward(batch_X)
              
                # Compute loss
                loss = self.compute_loss(batch_y, output)
                epoch_loss += loss
                num_batches += 1
              
                # Backward pass
                gradients = self.backward(batch_X, batch_y, output)
              
                # Update parameters using chosen method
                if method == 'parameter_server':
                    self.parameter_server_update(gradients)
                else:  # allreduce
                    self.allreduce_update(gradients)
          
            # Calculate average loss for this epoch
            avg_loss = epoch_loss / num_batches if num_batches > 0 else 0
          
            # Gather loss from all processes for monitoring
            all_losses = self.comm.gather(avg_loss, root=0)
          
            if self.rank == 0 and epoch % 10 == 0:
                global_avg_loss = np.mean(all_losses)
                print(f"Epoch {epoch}: Global average loss = {global_avg_loss:.4f}")
  
    def evaluate(self, X_test, y_test):
        """Evaluate the model"""
        predictions = self.forward(X_test)
        predicted_classes = (predictions > 0.5).astype(int)
        accuracy = np.mean(predicted_classes == y_test)
      
        # Gather accuracies from all processes
        all_accuracies = self.comm.gather(accuracy, root=0)
      
        if self.rank == 0:
            global_accuracy = np.mean(all_accuracies)
            print(f"Global test accuracy: {global_accuracy:.4f}")
            return global_accuracy
      
        return accuracy

def generate_distributed_dataset():
    """Generate a synthetic dataset distributed across processes"""
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
    size = comm.Get_size()
  
    # Generate different data on each process to simulate real distributed scenario
    np.random.seed(rank + 100)  # Different seed per process
  
    samples_per_process = 1000
    features = 20
  
    # Generate synthetic classification data
    X = np.random.randn(samples_per_process, features)
  
    # Create a complex decision boundary
    true_weights = np.random.randn(features)
    decision_boundary = np.dot(X, true_weights) + np.random.randn(samples_per_process) * 0.1
    y = (decision_boundary > 0).astype(int).reshape(-1, 1)
  
    print(f"Process {rank}: Generated {samples_per_process} samples with {features} features")
    print(f"Process {rank}: Class distribution: {np.mean(y):.2f} positive examples")
  
    return X, y

def distributed_ml_demo():
    """Demonstrate distributed machine learning"""
    comm = MPI.COMM_WORLD
    rank = comm.Get_rank()
  
    print(f"=== Distributed ML Demo - Process {rank} ===")
  
    # Generate distributed dataset
    X_train, y_train = generate_distributed_dataset()
  
    # Create neural network
    nn = DistributedNeuralNetwork(
        input_size=X_train.shape[1],
        hidden_size=10,
        output_size=1,
        learning_rate=0.1
    )
  
    # Train using AllReduce (more efficient for small clusters)
    print(f"\nProcess {rank}: Training with AllReduce...")
    start_time = time.time()
    nn.train_distributed(X_train, y_train, epochs=50, method='allreduce')
    training_time = time.time() - start_time
  
    if rank == 0:
        print(f"Training completed in {training_time:.2f} seconds")
  
    # Generate test data (same across all processes for fair evaluation)
    np.random.seed(999)  # Same seed for all processes
    X_test, y_test = generate_distributed_dataset()
  
    # Evaluate model
    print(f"\nProcess {rank}: Evaluating model...")
    nn.evaluate(X_test, y_test)

if __name__ == "__main__":
    distributed_ml_demo()
```

```bash
# Run the distributed ML example
mpirun -n 4 python distributed_ml.py
```

## Summary: Key Takeaways

> **Distributed Computing Mental Model** : Think of distributed computing as coordinating a team of specialists, each with their own expertise and resources, working together on a complex project that no single person could complete alone.

**Essential Concepts Covered:**

1. **Fundamental Distinction** : Concurrency vs. Parallelism vs. Distribution
2. **MPI Core Patterns** : Point-to-point, collective communication, topologies
3. **Optimization Strategies** : Load balancing, communication minimization, fault tolerance
4. **Real-world Integration** : Scientific computing, machine learning, data processing

**Best Practices Summary:**

```python
# ✅ Good distributed computing practices
class DistributedBestPractices:
    """Summary of key principles"""
  
    def design_principles(self):
        """Core design principles"""
        return {
            'minimize_communication': 'Network is usually the bottleneck',
            'balance_load': 'Idle processes waste resources',
            'plan_for_failures': 'Hardware failures are inevitable at scale',
            'locality_matters': 'Keep data close to computation',
            'measure_everything': 'Profile before optimizing'
        }
  
    def communication_patterns(self):
        """When to use different patterns"""
        return {
            'broadcast': 'Distribute configuration or model weights',
            'scatter_gather': 'Divide work, collect results',
            'allreduce': 'Gradient averaging in ML',
            'point_to_point': 'Specific data exchange',
            'ring': 'Sequential processing with dependencies'
        }
  
    def scaling_considerations(self):
        """How to scale effectively"""
        return {
            'strong_scaling': 'Same problem size, more processors',
            'weak_scaling': 'Bigger problems with more processors',
            'communication_overhead': 'Grows with cluster size',
            'synchronization_costs': 'Global barriers expensive',
            'fault_tolerance': 'Critical for large clusters'
        }
```

**When to Use Distributed Computing:**

* **Data exceeds single machine memory** (100GB+ datasets)
* **Computation time is prohibitive** (days/weeks on single machine)
* **High availability requirements** (cannot afford downtime)
* **Geographical distribution needed** (global user base)
* **Specialized hardware required** (GPUs, FPGAs distributed across cluster)

**Python's Role in Distributed Systems:**

Python excels at orchestrating distributed systems, handling complex data workflows, and integrating diverse components, even if raw computation might be delegated to compiled languages or specialized hardware.

This comprehensive guide provides the foundation for understanding and implementing distributed computing solutions with Python, from basic concepts to production-ready systems. The key is starting simple and gradually adding complexity as your understanding and requirements grow.
