# Multiple RUN vs Multiple COPY Layers in Docker: A Comparative Analysis

When optimizing Docker images, understanding the different impacts of `RUN` versus `COPY` instructions is crucial. These instructions affect the layering system in fundamentally different ways, and this distinction has significant implications for image size, build performance, and overall efficiency.

## The Fundamental Difference

At their core, `RUN` and `COPY` instructions differ in what they typically do to the filesystem:

### RUN Instructions: State Transformation with Side Effects

A `RUN` instruction executes commands inside the container environment, often creating temporary files before reaching its final state. Take this example:

```dockerfile
RUN apt-get update && apt-get install -y python3
```

What's actually happening:

1. Downloads package lists (hundreds of MB of temporary data)
2. Downloads .deb package files (more temporary data)
3. Unpacks and installs the packages
4. Leaves behind both the installed software AND all the temporary files

If you don't clean up in the same layer where these files were created, the temporary files become permanently embedded in that layer, even if deleted in a subsequent layer.

### COPY Instructions: Pure Content Addition

A `COPY` instruction simply adds files from your build context to the image without creating any hidden temporary data:

```dockerfile
COPY myapp.py /app/
```

This creates a layer containing exactly what you see - just the `myapp.py` file at the specified location.

## The Impact on Layer Size

Let's examine a concrete example:

**Multiple RUN layers approach:**

```dockerfile
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get clean
```

Layer 1: +50MB (package lists)
Layer 2: +200MB (installed packages + .deb files)
Layer 3: +0MB (marking files as deleted, but they still exist in layer 2)
**Total: 250MB** (even though the final state only needs ~100MB)

**Single RUN layer approach:**

```dockerfile
RUN apt-get update && apt-get install -y python3 && apt-get clean
```

Layer 1: +100MB (only the installed packages remain)
**Total: 100MB** (60% smaller)

**Multiple COPY layers approach:**

```dockerfile
COPY file1.txt /app/
COPY file2.txt /app/
COPY file3.txt /app/
```

Layer 1: +0.1MB (exactly file1.txt)
Layer 2: +0.1MB (exactly file2.txt)
Layer 3: +0.1MB (exactly file3.txt)
**Total: 0.3MB** (exactly what you'd expect)

This demonstrates why multiple `RUN` instructions are much more problematic than multiple `COPY` instructions.

## The Cache Invalidation Perspective

Another critical aspect is how these instructions affect cache invalidation:

### RUN Cache Invalidation

Cache for a `RUN` instruction is invalidated when:

* The `RUN` command string itself changes
* Any previous layer has changed

Since `RUN` commands often produce variable outputs (timestamps in logs, random temporary filenames, etc.), they can sometimes invalidate even when the command hasn't changed.

### COPY Cache Invalidation

Cache for a `COPY` instruction is invalidated when:

* The actual content of copied files changes
* Any previous layer has changed

Docker is smart about `COPY` - it calculates checksums of the actual file contents, not just the modification times.

## Strategic Implications

This fundamental difference leads to different optimal strategies:

### For RUN Instructions

**Optimal approach:** Combine related `RUN` instructions to minimize layer count while ensuring each logical component has its own layer.

Good pattern:

```dockerfile
# System dependencies layer
RUN apt-get update && \
    apt-get install -y pkg1 pkg2 && \
    apt-get clean

# Python dependencies layer
RUN pip install --no-cache-dir -r requirements.txt
```

### For COPY Instructions

**Optimal approach:** Strategically separate `COPY` instructions based on change frequency, not size concerns.

Good pattern:

```dockerfile
# Rarely changing dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Frequently changing application code
COPY . .
```

This way, changes to your application code don't invalidate the expensive dependency installation step.

## Real-world Comparison: An Example Application

Consider a Node.js application with this file structure:

* `package.json` (10KB)
* `package-lock.json` (100KB)
* Source code in `src/` directory (500KB)

**Approach 1: Multiple COPY layers**

```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./src ./src
CMD ["node", "src/index.js"]
```

**Approach 2: Single COPY layer**

```dockerfile
FROM node:14
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "src/index.js"]
```

If you change your source code frequently:

* Approach 1: Only rebuilds the last layer, reusing the cached `npm install` layer
* Approach 2: Invalidates the `COPY . .` layer, forcing `npm install` to run every time

The time difference could be minutes versus seconds for each build, even though both produce similar final images.

## Situations Where Multiple COPY Layers Can Cause Problems

Multiple `COPY` layers aren't always better. They can be problematic when:

1. **Copying the same files multiple times** :

```dockerfile
   COPY ./build/deps/ /app/deps/
   COPY ./build/ /app/
```

   This creates redundancy, as the deps directory is copied twice.

1. **When each COPY touches huge numbers of files** :
   Docker has some overhead processing each file in a `COPY` instruction. With thousands of small files, many small `COPY` layers might be less efficient than one large one.

## Conclusion and Best Practices

To summarize the differences:

1. **Multiple RUN layers:**
   * Often significantly increase final image size
   * Can embed temporary files permanently
   * Are hard to clean up after the fact
   * Should generally be combined into logical groups
2. **Multiple COPY layers:**
   * Final image size is usually unaffected
   * Each layer contains exactly what you specify
   * Help optimize cache utilization
   * Should be organized by change frequency

Best practices to follow:

1. **RUN instructions:**
   * Combine related operations (especially package management)
   * Clean up temporary files in the same layer they're created
   * Use `--no-cache` flags with package managers when possible
   * Group by logical functionality and update frequency
2. **COPY instructions:**
   * Place files that change less frequently earlier in the Dockerfile
   * Separate dependency manifests (package.json, requirements.txt) from application code
   * Avoid copying unnecessary files (use .dockerignore)
   * Be aware of directory structure to avoid copying the same files multiple times

By understanding these fundamental differences, you can create Docker images that are both efficient in size and optimized for the development workflow, with faster builds and better cache utilization.
