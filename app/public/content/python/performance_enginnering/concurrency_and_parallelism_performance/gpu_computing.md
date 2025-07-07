# GPU Computing in Python: From First Principles

Let's build up understanding of GPU computing from the ground up, starting with fundamental computational concepts and progressing to advanced Python GPU programming.

## Chapter 1: Why GPU Computing Exists

### The Fundamental Problem: Sequential vs Parallel Computation

```python
# Traditional CPU approach: Sequential processing
def add_arrays_cpu(a, b):
    """Process one element at a time"""
    result = []
    for i in range(len(a)):
        result.append(a[i] + b[i])  # One addition per time step
    return result

# What we really want: All additions happening simultaneously
# This is where GPUs excel
```

> **Key Insight** : CPUs are optimized for complex, sequential tasks with lots of branching logic. GPUs are optimized for simple, repetitive tasks that can be done in parallel across thousands of data elements simultaneously.

### The Architecture Difference

```
CPU Architecture (4-8 cores):
┌─────────────┐  ┌─────────────┐
│ Complex     │  │ Complex     │
│ Core        │  │ Core        │  
│ + Cache     │  │ + Cache     │
│ + Control   │  │ + Control   │
└─────────────┘  └─────────────┘
┌─────────────┐  ┌─────────────┐
│ Complex     │  │ Complex     │
│ Core        │  │ Core        │
│ + Cache     │  │ + Cache     │
│ + Control   │  │ + Control   │
└─────────────┘  └─────────────┘

GPU Architecture (1000s of cores):
┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐
│S││S││S││S││S││S││S││S│  } Streaming
└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘    Multiprocessor
┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐
│S││S││S││S││S││S││S││S│
└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘
... hundreds more simple cores
```

## Chapter 2: The Memory Challenge

### Understanding GPU Memory Hierarchy

```python
# This seemingly simple operation involves complex memory management
import numpy as np

# CPU array (in system RAM)
cpu_array = np.array([1, 2, 3, 4, 5])

# To use GPU, data must be copied to GPU memory
# gpu_array = somehow_copy_to_gpu(cpu_array)  # We'll see how later
```

```
Memory Hierarchy:
┌─────────────────┐
│   CPU (Host)    │
│                 │
│ ┌─────────────┐ │
│ │ System RAM  │ │ ← NumPy arrays live here
│ │   (GBs)     │ │
│ └─────────────┘ │
└─────────────────┘
        │
        │ PCIe Bus (bottleneck!)
        │
┌─────────────────┐
│   GPU (Device)  │
│                 │
│ ┌─────────────┐ │
│ │ GPU Memory  │ │ ← GPU arrays must live here
│ │   (GBs)     │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ Shared Mem  │ │ ← Fast but tiny
│ │   (KBs)     │ │
│ └─────────────┘ │
└─────────────────┘
```

> **Critical Concept** : The biggest challenge in GPU computing isn't the computation itself—it's managing data movement between CPU and GPU memory. This transfer is often the performance bottleneck.

## Chapter 3: Enter Python GPU Libraries

### The Two Main Approaches

```python
# Approach 1: CuPy - NumPy-like interface (high-level)
import cupy as cp
gpu_array = cp.array([1, 2, 3, 4, 5])  # Looks just like NumPy!

# Approach 2: PyCUDA - Direct CUDA programming (low-level)
import pycuda.autoinit
import pycuda.driver as cuda
# Much more verbose, but maximum control
```

> **Design Philosophy** : CuPy prioritizes ease of use and NumPy compatibility. PyCUDA prioritizes performance and fine-grained control. Choose based on your needs: rapid prototyping vs. maximum optimization.

## Chapter 4: CuPy - GPU Arrays Made Simple

### Basic CuPy Operations

```python
import cupy as cp
import numpy as np

# Creating arrays - multiple ways
print("=== Array Creation ===")

# Method 1: Direct creation on GPU
gpu_array = cp.array([1, 2, 3, 4, 5])
print(f"GPU array: {gpu_array}")
print(f"Device: {gpu_array.device}")  # Shows which GPU

# Method 2: Copy from NumPy
cpu_array = np.array([1, 2, 3, 4, 5])
gpu_array = cp.asarray(cpu_array)  # Copies to GPU

# Method 3: Create directly with shape
large_gpu_array = cp.zeros((1000, 1000))  # Million zeros on GPU
```

### The NumPy Compatibility Advantage

```python
# Nearly identical syntax to NumPy
def demonstrate_compatibility():
    """Show how CuPy mirrors NumPy operations"""
  
    # NumPy version
    np_a = np.random.random((1000, 1000))
    np_b = np.random.random((1000, 1000))
    np_result = np.dot(np_a, np_b)  # Matrix multiplication on CPU
  
    # CuPy version - almost identical code!
    cp_a = cp.random.random((1000, 1000))  # Created directly on GPU
    cp_b = cp.random.random((1000, 1000))
    cp_result = cp.dot(cp_a, cp_b)  # Matrix multiplication on GPU
  
    # The syntax is nearly identical, but performance can be 10-100x faster
    return np_result, cp_result

# This is the power of CuPy - familiar interface, GPU performance
```

### Memory Movement - The Critical Concept

```python
import time

def understand_memory_transfers():
    """Demonstrate the cost of memory transfers"""
  
    # Create large arrays
    size = 10_000_000  # 10 million elements
  
    print("=== Memory Transfer Costs ===")
  
    # 1. CPU computation
    start = time.time()
    cpu_a = np.random.random(size)
    cpu_b = np.random.random(size)
    cpu_result = cpu_a + cpu_b  # Simple addition
    cpu_time = time.time() - start
    print(f"CPU time: {cpu_time:.4f}s")
  
    # 2. Naive GPU approach (lots of transfers)
    start = time.time()
    gpu_a = cp.asarray(cpu_a)  # Transfer 1: CPU → GPU
    gpu_b = cp.asarray(cpu_b)  # Transfer 2: CPU → GPU  
    gpu_result = gpu_a + gpu_b  # GPU computation (fast!)
    result_back = cp.asnumpy(gpu_result)  # Transfer 3: GPU → CPU
    naive_gpu_time = time.time() - start
    print(f"Naive GPU time: {naive_gpu_time:.4f}s")
  
    # 3. Smart GPU approach (minimize transfers)
    start = time.time()
    # Create data directly on GPU
    gpu_a = cp.random.random(size)  # No transfer needed
    gpu_b = cp.random.random(size)  # No transfer needed
    gpu_result = gpu_a + gpu_b      # GPU computation
    # Only transfer final result if needed
    smart_gpu_time = time.time() - start
    print(f"Smart GPU time: {smart_gpu_time:.4f}s")
```

> **Golden Rule of GPU Computing** : Minimize data transfers between CPU and GPU. Create data on GPU when possible, perform multiple operations there, then transfer results back only when necessary.

## Chapter 5: GPU Memory Management Deep Dive

### Understanding GPU Memory Types

```python
import cupy as cp

def explore_gpu_memory():
    """Understand different types of GPU memory"""
  
    print("=== GPU Memory Management ===")
  
    # 1. Global Memory (main GPU memory)
    global_array = cp.zeros(1000000)  # Lives in global memory
    print(f"Global memory array: {global_array.nbytes / 1024 / 1024:.2f} MB")
  
    # 2. Memory pools for efficiency
    # CuPy uses memory pools to avoid repeated malloc/free
    mempool = cp.get_default_memory_pool()
    print(f"Memory pool used: {mempool.used_bytes() / 1024 / 1024:.2f} MB")
    print(f"Memory pool total: {mempool.total_bytes() / 1024 / 1024:.2f} MB")
  
    # 3. Explicit memory management
    # Sometimes you need control over when memory is freed
    large_array = cp.zeros((5000, 5000))  # 200MB array
    print(f"Created large array: {large_array.nbytes / 1024 / 1024:.2f} MB")
  
    # Force garbage collection
    del large_array  # Remove reference
    cp.get_default_memory_pool().free_all_blocks()  # Actually free memory
    print("Memory freed")
```

### Memory Transfer Patterns

```python
def memory_transfer_patterns():
    """Demonstrate different memory transfer strategies"""
  
    # Pattern 1: Synchronous transfer (blocking)
    cpu_data = np.random.random((1000, 1000))
    gpu_data = cp.asarray(cpu_data)  # Blocks until transfer complete
  
    # Pattern 2: Pinned memory for faster transfers
    # Pinned memory can't be swapped out, making transfers faster
    with cp.cuda.stream.Stream():
        pinned_array = cp.cuda.alloc_pinned_memory(cpu_data.nbytes)
        # Faster transfers possible (if you have lots of data)
  
    # Pattern 3: Streaming transfers (advanced)
    # For very large datasets, transfer in chunks
    def stream_large_data(large_cpu_array, chunk_size=1000000):
        """Transfer large array in chunks"""
        n_elements = large_cpu_array.size
      
        for i in range(0, n_elements, chunk_size):
            end_idx = min(i + chunk_size, n_elements)
            chunk = large_cpu_array.flat[i:end_idx]
            gpu_chunk = cp.asarray(chunk)
            # Process gpu_chunk...
            # This overlaps transfer and computation
```

## Chapter 6: PyCUDA - Maximum Control

### When to Use PyCUDA vs CuPy

```python
# CuPy is great for this:
result = cp.dot(matrix_a, matrix_b) + cp.sin(vector_c)

# PyCUDA is better for this:
# - Custom kernels not available in standard libraries
# - Fine-tuned memory management  
# - Integration with existing CUDA C code
# - Maximum performance for specific algorithms
```

### Basic PyCUDA Example

```python
import pycuda.autoinit  # Automatically initialize CUDA
import pycuda.driver as cuda
import pycuda.gpuarray as gpuarray
import numpy as np

def basic_pycuda_example():
    """Simple PyCUDA operation"""
  
    # Create arrays
    cpu_array = np.array([1, 2, 3, 4, 5], dtype=np.float32)
  
    # Transfer to GPU using PyCUDA
    gpu_array = gpuarray.to_gpu(cpu_array)
  
    # Simple operation
    gpu_result = gpu_array * 2  # Multiply by 2 on GPU
  
    # Transfer back
    cpu_result = gpu_result.get()
  
    print(f"Original: {cpu_array}")
    print(f"GPU Result: {cpu_result}")
```

### Custom CUDA Kernels with PyCUDA

```python
from pycuda.compiler import SourceModule

def custom_kernel_example():
    """Write custom CUDA kernel in Python"""
  
    # CUDA C code embedded in Python string
    cuda_code = """
    __global__ void vector_add(float *a, float *b, float *c, int n) {
        // Each thread handles one element
        int idx = blockIdx.x * blockDim.x + threadIdx.x;
      
        if (idx < n) {
            c[idx] = a[idx] + b[idx];
        }
    }
    """
  
    # Compile the kernel
    mod = SourceModule(cuda_code)
    vector_add = mod.get_function("vector_add")
  
    # Create test data
    n = 1000
    a = np.random.random(n).astype(np.float32)
    b = np.random.random(n).astype(np.float32)
    c = np.zeros_like(a)
  
    # Transfer to GPU
    a_gpu = gpuarray.to_gpu(a)
    b_gpu = gpuarray.to_gpu(b)
    c_gpu = gpuarray.to_gpu(c)
  
    # Launch kernel
    block_size = 256
    grid_size = (n + block_size - 1) // block_size
  
    vector_add(
        a_gpu, b_gpu, c_gpu, np.int32(n),
        block=(block_size, 1, 1),  # Threads per block
        grid=(grid_size, 1)        # Blocks per grid
    )
  
    # Get result
    result = c_gpu.get()
    print(f"Custom kernel result shape: {result.shape}")
```

> **PyCUDA Power** : While more complex than CuPy, PyCUDA lets you write custom GPU kernels in CUDA C, giving you the same performance as native CUDA development but with Python integration.

## Chapter 7: GPU Memory Management Advanced Concepts

### Memory Coalescing and Access Patterns

```python
def demonstrate_memory_access_patterns():
    """Show how memory access patterns affect performance"""
  
    # Good pattern: Sequential access (coalesced)
    # When threads access consecutive memory locations
    data = cp.arange(1000000, dtype=cp.float32)
  
    # This is efficient - each thread accesses adjacent elements
    result1 = data[::1]  # Every element
  
    # Less efficient: Strided access
    # Threads access memory locations far apart
    result2 = data[::1000]  # Every 1000th element
  
    # Memory coalescing happens automatically in CuPy,
    # but understanding it helps optimize custom kernels
```

### Memory Pool Management

```python
def advanced_memory_management():
    """Demonstrate sophisticated memory management"""
  
    print("=== Advanced Memory Management ===")
  
    # Get memory pool handle
    mempool = cp.get_default_memory_pool()
  
    # Monitor memory usage
    def print_memory_stats(label):
        used = mempool.used_bytes() / 1024 / 1024
        total = mempool.total_bytes() / 1024 / 1024
        print(f"{label}: Used {used:.2f} MB, Total {total:.2f} MB")
  
    print_memory_stats("Initial")
  
    # Create large arrays
    arrays = []
    for i in range(5):
        arr = cp.random.random((1000, 1000))  # ~8MB each
        arrays.append(arr)
        print_memory_stats(f"After array {i+1}")
  
    # Delete arrays but memory might not be freed immediately
    del arrays
    print_memory_stats("After deletion")
  
    # Force memory release
    mempool.free_all_blocks()
    print_memory_stats("After free_all_blocks()")
  
    # Set memory limit to prevent out-of-memory
    mempool.set_limit(size=1024**3)  # 1GB limit
    print("Set 1GB memory limit")
```

### Context Management for Multiple GPUs

```python
def multi_gpu_management():
    """Handle multiple GPUs"""
  
    # Check available GPUs
    n_gpus = cp.cuda.runtime.getDeviceCount()
    print(f"Available GPUs: {n_gpus}")
  
    if n_gpus > 1:
        # Use different GPUs
        with cp.cuda.Device(0):  # Use GPU 0
            gpu0_array = cp.array([1, 2, 3])
            print(f"Array on GPU 0: {gpu0_array.device}")
      
        with cp.cuda.Device(1):  # Use GPU 1
            gpu1_array = cp.array([4, 5, 6])
            print(f"Array on GPU 1: {gpu1_array.device}")
      
        # Arrays on different GPUs can't directly interact
        # Need to copy through CPU or use peer-to-peer transfers
```

## Chapter 8: Performance Optimization Strategies

### Benchmarking GPU vs CPU

```python
import time
import matplotlib.pyplot as plt

def comprehensive_benchmark():
    """Compare CPU vs GPU performance across different problem sizes"""
  
    sizes = [100, 1000, 10000, 100000, 1000000]
    cpu_times = []
    gpu_times = []
  
    for size in sizes:
        print(f"Testing size: {size}")
      
        # CPU benchmark
        start = time.time()
        a_cpu = np.random.random(size)
        b_cpu = np.random.random(size)
        result_cpu = np.sqrt(a_cpu**2 + b_cpu**2)  # Vector magnitude
        cpu_time = time.time() - start
        cpu_times.append(cpu_time)
      
        # GPU benchmark
        start = time.time()
        a_gpu = cp.random.random(size)
        b_gpu = cp.random.random(size)
        result_gpu = cp.sqrt(a_gpu**2 + b_gpu**2)
        cp.cuda.Device().synchronize()  # Wait for GPU to finish
        gpu_time = time.time() - start
        gpu_times.append(gpu_time)
      
        print(f"  CPU: {cpu_time:.6f}s, GPU: {gpu_time:.6f}s")
        print(f"  Speedup: {cpu_time/gpu_time:.2f}x")
```

> **Performance Insight** : GPU advantages become apparent with larger datasets. For small arrays, CPU might be faster due to transfer overhead. The crossover point is typically around 10,000-100,000 elements.

### Common Performance Pitfalls

```python
def performance_pitfalls():
    """Demonstrate common mistakes that hurt performance"""
  
    print("=== Performance Pitfalls ===")
  
    # Pitfall 1: Frequent CPU-GPU transfers
    def bad_approach():
        """Inefficient: Transfer for each operation"""
        cpu_data = np.random.random(100000)
        result = 0
      
        for i in range(100):  # 100 operations
            gpu_data = cp.asarray(cpu_data)  # Transfer to GPU
            gpu_result = cp.sum(gpu_data)    # Compute on GPU
            result += cp.asnumpy(gpu_result)  # Transfer back
        return result
  
    def good_approach():
        """Efficient: Single transfer, multiple operations"""
        cpu_data = np.random.random(100000)
        gpu_data = cp.asarray(cpu_data)  # Single transfer to GPU
      
        result = 0
        for i in range(100):  # 100 operations
            gpu_result = cp.sum(gpu_data)  # All on GPU
            result += gpu_result           # Accumulate on GPU
      
        return cp.asnumpy(result)  # Single transfer back
  
    # Pitfall 2: Small array operations
    def demonstrate_overhead():
        """Show GPU overhead for small operations"""
        small_array = cp.array([1, 2, 3])  # Too small for GPU benefit
        large_array = cp.random.random(1000000)  # Good for GPU
      
        # The overhead of launching GPU kernels makes small operations slow
        return small_array, large_array
```

## Chapter 9: Real-World Applications

### Scientific Computing Example

```python
def monte_carlo_pi_estimation():
    """Use GPU to estimate π using Monte Carlo method"""
  
    def estimate_pi_gpu(n_samples):
        """GPU-accelerated π estimation"""
        # Generate random points in unit square
        x = cp.random.random(n_samples, dtype=cp.float32)
        y = cp.random.random(n_samples, dtype=cp.float32)
      
        # Check if points are inside unit circle
        inside_circle = (x**2 + y**2) <= 1.0
      
        # Count points inside circle
        count_inside = cp.sum(inside_circle)
      
        # Estimate π: (points in circle / total points) * 4
        pi_estimate = 4.0 * count_inside / n_samples
        return float(pi_estimate)
  
    # Test with different sample sizes
    for n in [10000, 100000, 1000000, 10000000]:
        pi_est = estimate_pi_gpu(n)
        error = abs(pi_est - np.pi)
        print(f"n={n:8d}: π ≈ {pi_est:.6f}, error = {error:.6f}")
```

### Image Processing Example

```python
def gpu_image_processing():
    """Demonstrate GPU image processing"""
  
    # Create a sample image (or load with PIL/OpenCV)
    height, width = 1000, 1000
    image = cp.random.random((height, width, 3), dtype=cp.float32)
  
    def gaussian_blur_gpu(image, sigma=1.0):
        """Simple Gaussian blur on GPU"""
        from scipy import ndimage
        # For real applications, use cupy.ndimage or custom kernels
      
        # Convert to CPU for scipy (in practice, use CuPy equivalents)
        cpu_image = cp.asnumpy(image)
        blurred_cpu = ndimage.gaussian_filter(cpu_image, sigma=sigma)
        blurred_gpu = cp.asarray(blurred_cpu)
      
        return blurred_gpu
  
    def apply_filters(image):
        """Apply multiple filters efficiently on GPU"""
        # Edge detection filter
        sobel_x = cp.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=cp.float32)
        sobel_y = cp.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=cp.float32)
      
        # Convert to grayscale
        gray = cp.mean(image, axis=2)
      
        # Apply convolution (simplified - use scipy.ndimage in practice)
        # This demonstrates keeping data on GPU through multiple operations
        processed = gray * 0.8 + 0.2  # Simple brightness adjustment
      
        return processed
  
    # Process image entirely on GPU
    result = apply_filters(image)
    print(f"Processed image shape: {result.shape}")
```

## Chapter 10: Integration and Best Practices

### Integrating with Existing NumPy Code

```python
def seamless_integration():
    """Show how to gradually adopt GPU computing"""
  
    # Strategy 1: Drop-in replacement for hot loops
    def original_cpu_function(data):
        """Original CPU implementation"""
        result = np.zeros_like(data)
        for i in range(len(data)):
            result[i] = np.sin(data[i]) * np.cos(data[i])
        return result
  
    def gpu_accelerated_function(data):
        """GPU-accelerated version"""
        # Check if input is already on GPU
        if isinstance(data, cp.ndarray):
            gpu_data = data
        else:
            gpu_data = cp.asarray(data)
      
        # Vectorized operation on GPU
        result = cp.sin(gpu_data) * cp.cos(gpu_data)
      
        # Return same type as input
        if isinstance(data, cp.ndarray):
            return result
        else:
            return cp.asnumpy(result)
  
    # Strategy 2: Context manager for GPU sections
    class GPUContext:
        """Context manager for GPU computations"""
        def __init__(self):
            self.arrays = {}
      
        def __enter__(self):
            return self
      
        def __exit__(self, exc_type, exc_val, exc_tb):
            # Clean up GPU memory
            for key in self.arrays:
                del self.arrays[key]
            cp.get_default_memory_pool().free_all_blocks()
      
        def to_gpu(self, name, array):
            """Move array to GPU and track it"""
            self.arrays[name] = cp.asarray(array)
            return self.arrays[name]
      
        def to_cpu(self, name):
            """Move array back to CPU"""
            return cp.asnumpy(self.arrays[name])
  
    # Usage example
    data = np.random.random(1000000)
  
    with GPUContext() as gpu:
        gpu_data = gpu.to_gpu('data', data)
        gpu_result = cp.sqrt(gpu_data**2 + 1)
        result = gpu.to_cpu('data')  # Automatically cleaned up
```

### Error Handling and Debugging

```python
def robust_gpu_code():
    """Demonstrate proper error handling for GPU code"""
  
    try:
        # Check GPU availability
        if cp.cuda.is_available():
            print(f"CUDA available: {cp.cuda.runtime.getDeviceCount()} devices")
        else:
            raise RuntimeError("CUDA not available")
      
        # Memory allocation with error handling
        try:
            large_array = cp.zeros((100000, 100000))  # May fail if not enough memory
        except cp.cuda.memory.OutOfMemoryError as e:
            print(f"GPU out of memory: {e}")
            # Fallback to smaller array or CPU
            large_array = cp.zeros((10000, 10000))
      
        # Operation with synchronization for debugging
        result = cp.sum(large_array)
        cp.cuda.Device().synchronize()  # Wait for completion
      
        return result
      
    except Exception as e:
        print(f"GPU error: {e}")
        # Graceful fallback to CPU
        return np.sum(np.zeros((10000, 10000)))
```

### Performance Profiling

```python
def profile_gpu_code():
    """Tools for profiling GPU performance"""
  
    # Method 1: CuPy's built-in profiler
    with cp.cuda.profile():
        data = cp.random.random((10000, 10000))
        result = cp.fft.fft2(data)  # 2D FFT
  
    # Method 2: Manual timing with synchronization
    def time_gpu_operation(func, *args, **kwargs):
        """Accurately time GPU operations"""
        # Warm up
        for _ in range(3):
            func(*args, **kwargs)
      
        cp.cuda.Device().synchronize()  # Ensure GPU is ready
      
        start = time.time()
        result = func(*args, **kwargs)
        cp.cuda.Device().synchronize()  # Wait for completion
        end = time.time()
      
        return result, end - start
  
    # Example usage
    data = cp.random.random((5000, 5000))
    result, gpu_time = time_gpu_operation(cp.linalg.svd, data)
    print(f"GPU SVD time: {gpu_time:.4f}s")
```

## Key Takeaways and Mental Models

> **The GPU Computing Mindset** :
>
> 1. **Think in parallel** : Design algorithms that can process many elements simultaneously
> 2. **Minimize transfers** : Keep data on GPU as long as possible
> 3. **Batch operations** : Combine multiple small operations into larger ones
> 4. **Profile everything** : GPU performance can be counter-intuitive

> **When to Use GPU Computing** :
>
> * Large arrays (>10,000 elements typically)
> * Embarrassingly parallel problems
> * Mathematical operations on arrays
> * Machine learning and scientific computing
> * Image/signal processing

> **When NOT to Use GPU Computing** :
>
> * Small datasets
> * Complex branching logic
> * Sequential algorithms
> * Heavy string processing
> * Irregular memory access patterns

```python
# Final example: Putting it all together
def comprehensive_gpu_pipeline():
    """A complete GPU computing pipeline"""
  
    print("=== Complete GPU Pipeline ===")
  
    # 1. Data generation (on GPU to avoid transfers)
    n = 1000000
    x = cp.linspace(0, 4*cp.pi, n)
    y = cp.sin(x) + 0.1 * cp.random.random(n)  # Noisy sine wave
  
    # 2. Signal processing (all on GPU)
    # Remove noise with moving average
    window_size = 100
    kernel = cp.ones(window_size) / window_size
  
    # Convolution for smoothing
    from cupyx.scipy import ndimage
    smoothed = ndimage.uniform_filter1d(y, size=window_size)
  
    # 3. Analysis (still on GPU)
    peaks = smoothed > cp.percentile(smoothed, 90)  # Find peaks
    peak_count = cp.sum(peaks)
  
    # 4. Results (minimal CPU transfer)
    print(f"Processed {n} points on GPU")
    print(f"Found {int(peak_count)} peaks")
    print(f"Mean signal value: {float(cp.mean(smoothed)):.4f}")
  
    # Only transfer small summary statistics, not raw data
    return {
        'n_points': n,
        'n_peaks': int(peak_count),
        'mean_value': float(cp.mean(smoothed)),
        'std_value': float(cp.std(smoothed))
    }

# Run the complete pipeline
results = comprehensive_gpu_pipeline()
```

This comprehensive exploration shows how GPU computing in Python progresses from basic parallel processing concepts to sophisticated memory management and real-world applications. The key is understanding that GPU computing isn't just about making code faster—it's about thinking differently about how data flows through your algorithms and organizing computations to maximize parallel processing while minimizing the overhead of data movement.
