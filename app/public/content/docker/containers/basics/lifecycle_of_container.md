# Container Lifecycle: A First Principles Investigation

## I. What Is the Container Lifecycle?

At its most fundamental level, the container lifecycle refers to the series of states a container passes through from creation to deletion. Unlike traditional applications that might run indefinitely on a server, containers are designed with a more ephemeral philosophy—they can be created, run, stopped, restarted, and destroyed with minimal overhead.

To understand the container lifecycle deeply, we must examine the mechanics of how the Linux kernel and Docker's various components interact to transition containers between states. Let's explore each phase in detail, examining the exact kernel operations and resource management occurring behind the scenes.

## II. Pre-Creation: Images as the Blueprint

Before a container comes into existence, we need an image. Let's explore how images serve as the foundation for containers.

### Image Composition and Structure

A Docker image consists of multiple read-only layers stacked on top of each other. Each layer represents a set of filesystem changes.

For example, consider this simple Dockerfile:

```dockerfile
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y nginx
COPY index.html /var/www/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Each instruction creates a new layer:

1. `FROM ubuntu:20.04`: The base layer containing the Ubuntu filesystem
2. `RUN apt-get...`: A layer containing the changes made by installing nginx
3. `COPY index.html...`: A layer adding our custom HTML file

These layers are stored separately on disk as distinct directories managed by the storage driver. For example, if using OverlayFS, these might be in `/var/lib/docker/overlay2/`.

But what exactly is in a layer? Let's look deeper:

Each layer contains:

* A directory with the actual file contents that were added or modified
* A metadata file describing the layer and its relationships
* Pointers to parent layers

This structure enables efficient storage since identical layers can be shared between images. When you have two containers running nginx with only small differences, most of their filesystem is actually the same data on disk.

## III. Creation Phase: `docker create`

When you run `docker create`, several crucial steps occur before a container is ready to execute.

### Step 1: Configuration Generation

First, Docker generates a configuration for the container. This includes:

* A JSON configuration file containing command, environment variables, networking settings, etc.
* A unique ID (the long hexadecimal string you see)
* A name (either user-specified or automatically generated)

These configuration files get stored typically in `/var/lib/docker/containers/[container-id]/`. Let's look at a simple example of what this configuration contains:

```json
{
  "Id": "3f4e8b0c1d2a...",
  "Created": "2023-01-15T12:34:56.789012345Z",
  "Path": "nginx",
  "Args": ["-g", "daemon off;"],
  "State": {
    "Status": "created",
    "Running": false,
    "Paused": false,
    ...
  },
  "Image": "sha256:87a94228f133e2da99cb16d653cd1373c5b4e8689956386c1c11a4c68c5f6e29",
  "NetworkSettings": {
    ...
  },
  ...
}
```

### Step 2: Filesystem Preparation

Docker then prepares the container's filesystem by:

1. Creating a new thin writable layer on top of the image layers
2. Preparing a mount point for this container filesystem

For an OverlayFS storage driver, this involves:

* Creating a `merged` directory where all layers appear as a single filesystem
* Creating a `work` directory for OverlayFS's internal use
* Creating an empty `diff` directory for the container's writable layer

The exact directory structure in `/var/lib/docker/overlay2/` would look something like:

```
/var/lib/docker/overlay2/
├── l/  # Shortnamed symbolic links for each layer
├── [layer-id]/  # Directories for each image layer
│   ├── diff/  # Content of this layer
│   ├── link   # Name in the "l" directory
│   └── lower  # Names of lower layers
└── [container-id]/  # Container's top writable layer
    ├── diff/  # Empty directory for container writes
    ├── link   # Name in the "l" directory
    ├── lower  # Names of all image layers
    ├── merged/ # Mount point where all layers appear unified
    └── work/   # OverlayFS workdir
```

### Step 3: Network Preparation

Even in the created (but not yet started) state, Docker sets up the network namespace and interfaces:

1. Creates a new network namespace for the container
2. Creates virtual Ethernet pairs (veth devices)
3. Connects one end to the Docker bridge
4. Reserves the other end to place in the container's namespace when it starts

However, the key difference from a running container is that these interfaces are prepared but not yet fully configured or attached to the container's namespace.

## IV. Starting Phase: `docker start`

When you start a container with `docker start`, the static configuration becomes a running process.

### Step 1: Namespace Configuration

Docker configures the Linux namespaces to isolate the container:

1. **PID Namespace** : Creates a new process namespace where the container's main process will be PID 1.

```bash
# This is what happens under the hood
unshare --pid --fork --mount-proc /bin/bash
```

2. **Network Namespace** : Activates the pre-created network namespace and moves the prepared veth interface into it.

```bash
# Conceptually similar to
ip link set dev veth1 netns container_netns
```

3. **Mount Namespace** : Sets up a new mount namespace and mounts the container's filesystem.

```bash
# Simplified example
mount -t overlay overlay -o lowerdir=/lower1:/lower2,upperdir=/upper,workdir=/work /merged
```

4. **UTS Namespace** : Creates a namespace for hostname isolation.
5. **IPC Namespace** : Creates a namespace for IPC resources.
6. **User Namespace** (optional): Creates a namespace for UID/GID mapping.

### Step 2: Cgroups Configuration

Docker configures control groups to limit and account for resource usage:

1. Creates cgroup directories for the container in hierarchies like:
   * `/sys/fs/cgroup/memory/docker/[container-id]`
   * `/sys/fs/cgroup/cpu/docker/[container-id]`
2. Sets resource limits by writing to control files:
   * Memory limits: `echo 512000000 > /sys/fs/cgroup/memory/docker/[id]/memory.limit_in_bytes`
   * CPU shares: `echo 1024 > /sys/fs/cgroup/cpu/docker/[id]/cpu.shares`
3. Adds the container process to these cgroups by writing its PID to the `tasks` file.

### Step 3: Process Execution

Finally, Docker executes the container's primary process:

1. Uses the `clone()` system call with flags for the appropriate namespaces
2. Executes the container's entrypoint and command (e.g., `nginx -g "daemon off;"`)

The actual process creation occurs through `runc` (via containerd), which:

1. Sets up the execution environment (namespaces, cgroups, etc.)
2. Uses the `execve()` system call to replace itself with the container's process

Here's a simplified example of what happens at the kernel level:

```c
// Conceptual pseudocode of what runc does
pid_t child_pid = clone(child_func, 
                        child_stack + STACK_SIZE,
                        CLONE_NEWPID | CLONE_NEWNS | CLONE_NEWNET | CLONE_NEWUTS | CLONE_NEWIPC,
                        NULL);

// In the child process:
mount("overlay", "/merged", "overlay", 0, "lowerdir=/lower,upperdir=/upper,workdir=/work");
chroot("/merged");
execve("/bin/nginx", ["nginx", "-g", "daemon off;"], environ);
```

### Step 4: State Recording

Docker updates the container's state in its internal database:

* Sets "Running" to true
* Records the PID of the container's main process
* Updates the "StartedAt" timestamp

This information is stored in the container's configuration file: `/var/lib/docker/containers/[container-id]/config.v2.json`

## V. Running Phase

While a container is running, several important mechanisms are constantly at work.

### Resource Monitoring and Constraints

The cgroups subsystem continuously monitors and constrains the container's resource usage:

1. **CPU** : Enforces shares, quotas, and scheduling priorities
2. **Memory** : Enforces limits and monitors usage
3. **Block I/O** : Controls read/write priorities and limits
4. **Network** : Controls bandwidth (through tc, the traffic control subsystem)

For example, the memory cgroup keeps statistics in files like:

* `/sys/fs/cgroup/memory/docker/[id]/memory.usage_in_bytes` (current usage)
* `/sys/fs/cgroup/memory/docker/[id]/memory.max_usage_in_bytes` (peak usage)

If a container exceeds its memory limit, the kernel's OOM (Out of Memory) killer will terminate processes in that container.

### Copy-on-Write Filesystem in Action

During runtime, any modifications to the container's filesystem employ Copy-on-Write (CoW):

1. When a process attempts to modify a file from a read-only layer:
   * The file is copied to the writable layer
   * The modification is made to this copy
   * Subsequent reads see the modified version
2. For newly created files:
   * They're written directly to the writable layer
3. When a file is deleted:
   * A "whiteout" file is created in the writable layer
   * This special file tells the union filesystem to hide the file from lower layers

To understand this concretely, let's see what happens when a running nginx container modifies its configuration:

```bash
# Inside the container
echo "server_tokens off;" >> /etc/nginx/nginx.conf
```

1. The original `/etc/nginx/nginx.conf` exists in a read-only image layer
2. The file is copied to the container's writable layer
3. The modification is applied to the copy
4. The overlay filesystem presents the modified version to processes in the container

If we were to examine the container's writable layer directly from the host, we'd find:

```bash
cat /var/lib/docker/overlay2/[container-id]/diff/etc/nginx/nginx.conf
# Would show the modified config with "server_tokens off;" added
```

### Logging and Output

Docker captures the container's stdout and stderr, writing them to log files:

1. By default, these are stored as JSON files at `/var/lib/docker/containers/[container-id]/[container-id]-json.log`
2. Each line is stored with timestamps and stream type (stdout/stderr)

The Docker daemon uses inotify to watch for changes to these files when you run `docker logs`.

## VI. Pausing and Unpausing: `docker pause` and `docker unpause`

The pause feature uses the freezer cgroup subsystem to temporarily suspend all processes in a container without terminating them.

### Pausing Mechanism

When you run `docker pause [container]`:

1. Docker writes the container's cgroup ID to the freezer cgroup's `freeze` file:
   ```bash
   echo 1 > /sys/fs/cgroup/freezer/docker/[container-id]/freezer.state
   ```
2. The kernel suspends all processes in that cgroup, essentially stopping them from being scheduled for CPU time
3. Container state is updated to "paused" in Docker's records

The key distinction between pausing and stopping is that paused processes remain in memory. They're not terminated, they're just not given any CPU time.

### Unpausing Mechanism

When you run `docker unpause [container]`:

1. Docker writes "0" to the same freezer cgroup file:
   ```bash
   echo 0 > /sys/fs/cgroup/freezer/docker/[container-id]/freezer.state
   ```
2. The kernel resumes scheduling for the processes in that cgroup
3. Container state is updated to "running" in Docker's records

Processes resume exactly where they left off, with their memory state intact. They don't realize they were paused—it's as if time stood still for them.

## VII. Stopping Phase: `docker stop`

The stopping phase involves gracefully terminating the container's processes.

### Step 1: Signal Sending

When you run `docker stop [container]`:

1. Docker sends a SIGTERM signal to the container's main process (PID 1 inside the container):
   ```bash
   kill -SIGTERM [pid]
   ```
2. Docker waits for a grace period (default 10 seconds) for the process to terminate gracefully
3. If the process hasn't terminated after the grace period, Docker sends a SIGKILL signal:
   ```bash
   kill -SIGKILL [pid]
   ```

This two-step approach allows well-behaved applications to perform cleanup operations before shutting down.

### Step 2: Process Termination

When the main process receives SIGTERM, it should:

1. Stop accepting new work
2. Finish processing current work if possible
3. Close open files and network connections
4. Release resources
5. Exit cleanly

If the main process is properly designed to handle signals, it will manage the graceful shutdown of all its child processes. However, if it doesn't handle SIGTERM or fails to terminate within the grace period, the SIGKILL signal forces immediate termination without any cleanup.

### Step 3: Resource Cleanup

After the main process exits, Docker:

1. Removes the container from cgroups:
   ```bash
   rmdir /sys/fs/cgroup/memory/docker/[container-id]
   rmdir /sys/fs/cgroup/cpu/docker/[container-id]
   # etc. for other cgroups
   ```
2. Preserves the container's writable layer and configuration
3. Updates the container state in its database:
   * Sets "Running" to false
   * Records the exit code
   * Updates the "FinishedAt" timestamp

Unlike removal, stopping a container preserves its filesystem state. This allows you to:

* Inspect logs after the container has stopped
* Restart the container with the same filesystem state
* Commit the container to create a new image

## VIII. Restarting: `docker restart`

The restart operation combines stopping and starting:

1. Docker performs the stop operation (sends SIGTERM, waits, then SIGKILL if necessary)
2. Docker performs the start operation with the same configuration

What's interesting here is what's preserved versus what's reset:

**Preserved:**

* Container ID and name
* Container configuration (environment variables, volumes, etc.)
* Container's writable layer with all data written during previous runs

**Reset:**

* Process state (obviously, since the process was terminated)
* Runtime resource statistics

Docker also supports restart policies that automatically restart containers under certain conditions:

* `no`: Never automatically restart (default)
* `on-failure[:max-retries]`: Restart if the container exits with a non-zero status
* `always`: Always restart regardless of exit status
* `unless-stopped`: Always restart unless explicitly stopped by the user

These policies are implemented by the Docker daemon, which monitors container exits and automatically performs restarts based on the policy.

## IX. Removal Phase: `docker rm`

The final phase in a container's lifecycle is removal, which permanently deletes the container.

### Step 1: Enforced Stopping (if running)

If the container is still running when you run `docker rm -f [container]`:

1. Docker performs a forced stop (equivalent to `docker stop` but with a shorter grace period)
2. Proceeds to removal once the container has stopped

### Step 2: Resource Deletion

Docker then deletes all resources associated with the container:

1. Removes the container's writable layer:
   ```bash
   rm -rf /var/lib/docker/overlay2/[container-id]
   ```
2. Removes the container's configuration files:
   ```bash
   rm -rf /var/lib/docker/containers/[container-id]
   ```
3. Removes references to the container from Docker's internal database
4. Releases any named volumes that were created specifically for this container and aren't used elsewhere

The key distinction between stopping and removing is that removal is permanent—once removed, you cannot restart the container, and all data written to its writable layer is lost.

### Data Persistence Considerations

This highlights the importance of proper data persistence strategies in Docker:

1. **Volumes** : Data stored in Docker volumes persists even after container removal

```bash
   docker run -v my_volume:/app/data nginx
```

1. **Bind Mounts** : Data stored on the host filesystem persists after container removal

```bash
   docker run -v /host/path:/container/path nginx
```

1. **Named Volumes** : Can be explicitly managed and shared between containers

```bash
   docker volume create my_data
   docker run -v my_data:/app/data nginx
```

Without one of these mechanisms, data written inside a container is lost when the container is removed.

## X. Advanced Lifecycle Concepts

### Lifecycle Hooks

Docker provides several hooks allowing you to execute commands at specific points in a container's lifecycle:

1. **ONBUILD** in Dockerfiles: Triggers when the image is used as a base for another build
2. **HEALTHCHECK** : Periodically checks if the application is functioning correctly
3. **STOPSIGNAL** : Customizes which signal is sent when stopping the container

In addition, Docker Compose and orchestration systems like Kubernetes extend the lifecycle with additional hooks like:

* `preStart`: Runs before the container starts
* `postStart`: Runs after the container starts
* `preStop`: Runs before the container stops

### Container States and Transitions

To summarize the lifecycle states and transitions:

1. **Created** : Container exists but is not running

* From: Nothing (via `docker create`)
* To: Running (via `docker start`) or Removed (via `docker rm`)

1. **Running** : Container processes are active

* From: Created (via `docker start`) or Paused (via `docker unpause`) or Restarting
* To: Paused (via `docker pause`) or Exited (via `docker stop` or process exit) or Dead (on failure)

1. **Paused** : Container processes are suspended

* From: Running (via `docker pause`)
* To: Running (via `docker unpause`) or Removed (via `docker rm -f`)

1. **Exited** : Container processes have terminated

* From: Running (via `docker stop` or main process exit)
* To: Running (via `docker start`) or Removed (via `docker rm`)

1. **Dead** : Container failed to complete stopping/removal

* From: Running (on critical failure)
* To: Removed (via `docker rm -f`)

### State Inspection

You can observe these states using `docker inspect`:

```bash
docker inspect --format='{{.State.Status}}' [container]
```

Or see a high-level view with `docker ps -a`:

```bash
CONTAINER ID   IMAGE     COMMAND   STATUS                  
3f4e8b0c1d2a   nginx     "nginx"   Up 5 hours               # Running
9a8b7c6d5e4f   ubuntu    "bash"    Exited (0) 3 days ago    # Exited
1a2b3c4d5e6f   redis     "redis"   Paused                   # Paused
```

## XI. Container Orchestration: Extending the Lifecycle

In production environments, containers are typically managed by orchestration systems like Kubernetes, which extends the container lifecycle with additional concepts.

### Kubernetes Pod Lifecycle

In Kubernetes, the smallest deployable unit is a Pod, which can contain one or more containers:

1. **Pending** : Pod is accepted but not yet scheduled on a node
2. **Creating** : Images are being pulled and containers created
3. **Running** : All containers are running
4. **Succeeded** : All containers terminated successfully
5. **Failed** : At least one container terminated with failure
6. **Unknown** : Pod state cannot be determined

Kubernetes adds more granular lifecycle management:

1. **Readiness Probes** : Determine when a container is ready to accept traffic
2. **Liveness Probes** : Determine if a container is still running properly
3. **Startup Probes** : Determine when an application has started successfully

### Stateful Applications

For stateful applications, Kubernetes extends the lifecycle with StatefulSets:

1. Provides stable, persistent storage
2. Maintains a stable network identity
3. Performs ordered, graceful deployment and scaling

This allows stateful applications like databases to maintain their state across container restarts and node failures.

## XII. Real-World Example: Complete Lifecycle of a Web Application Container

Let's trace the complete lifecycle of a web application container to tie all these concepts together:

### 1. Image Building

```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Building this image creates several layers:

* Base Node.js layer
* A layer with package.json
* A layer with node_modules
* A layer with application code

### 2. Container Creation

```bash
docker create --name webapp -p 8080:3000 mywebapp:1.0
```

Docker:

* Creates a container configuration
* Prepares a writable layer
* Sets up networking (but doesn't activate it yet)
* Assigns the container ID and name

### 3. Container Start

```bash
docker start webapp
```

Docker:

* Creates and configures namespaces
* Sets up cgroups
* Mounts the container filesystem
* Executes the CMD: `npm start`
* Application starts listening on port 3000 (mapped to 8080 on host)

### 4. Runtime

The container runs, serving web requests. Behind the scenes:

* OverlayFS handles filesystem operations with copy-on-write
* The container writes logs to stdout/stderr
* Docker captures these logs to `/var/lib/docker/containers/[id]/[id]-json.log`
* cgroups constrain and account for resource usage

Let's say the application writes session data to `/app/data/sessions.json`. This file is created in the container's writable layer.

### 5. Pausing (optional)

```bash
docker pause webapp
```

The application processes freeze but remain in memory. No requests are processed during this time.

### 6. Unpausing (optional)

```bash
docker unpause webapp
```

The application resumes processing requests as if nothing happened.

### 7. Stopping

```bash
docker stop webapp
```

Docker:

* Sends SIGTERM to the npm process (PID 1 inside container)
* npm forwards this to the Node.js application
* Application has 10 seconds to close connections and save state
* If it doesn't exit in time, Docker sends SIGKILL

### 8. Restarting (optional)

```bash
docker restart webapp
```

Docker:

* Stops the container as above
* Starts it again with the same configuration
* The container's writable layer is preserved, so `/app/data/sessions.json` still exists

### 9. Committing (optional)

```bash
docker commit webapp mywebapp:1.1
```

This creates a new image with the container's writable layer added as a read-only layer.

### 10. Removal

```bash
docker rm webapp
```

Docker:

* Deletes the container's writable layer (including sessions.json)
* Removes configuration files
* Releases associated resources

If we had mounted a volume:

```bash
docker run -v webapp_data:/app/data mywebapp:1.0
```

Then the sessions data would persist beyond container removal.

## XIII. Conclusion: The Philosophical Implications of Container Lifecycle

The container lifecycle embodies several key principles of modern software architecture:

### Immutability

Containers are designed to be immutable during runtime. Rather than modifying a running container, the preferred approach is to:

1. Build a new image
2. Deploy a new container
3. Remove the old container

This immutability provides consistency and reproducibility across environments.

### Ephemerality

Containers are intentionally ephemeral—designed to be easily created and destroyed. This encourages:

1. Stateless application design
2. Explicit management of persistent state
3. Resilience to infrastructure changes

### Separation of Concerns

The container lifecycle separates:

1. **Build time** (image creation): Focused on application code and dependencies
2. **Run time** (container execution): Focused on configuration and data

This separation simplifies both development and operations.

### Density and Efficiency

Through the careful management of processes, namespaces, cgroups, and the filesystem, containers achieve higher density than traditional virtualization:

1. Multiple containers can share the same kernel
2. Identical layers are shared between containers
3. Resources can be allocated with fine-grained control

Understanding the container lifecycle at this deep level allows you to:

1. Design more efficient containerized applications
2. Troubleshoot container issues effectively
3. Implement proper patterns for state management
4. Optimize resource utilization in container environments

By mastering these concepts, you can fully leverage the power and flexibility of container technology to build resilient, scalable, and efficient applications.
