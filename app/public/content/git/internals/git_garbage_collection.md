# Understanding Git's Garbage Collection and Object Pruning

Git's garbage collection and object pruning mechanisms are essential but often overlooked aspects of Git's internal workings. Let me explain these concepts from first principles, showing how Git manages its object database efficiently.

## The Foundation: Git's Object Model

To understand garbage collection in Git, we first need to grasp how Git stores data. At its core, Git is a content-addressable filesystem, meaning it stores objects and retrieves them by their content.

### The Four Types of Git Objects

1. **Blobs**: Store file contents
2. **Trees**: Represent directories and contain pointers to blobs and other trees
3. **Commits**: Point to trees and contain metadata like author, message, and parent commits
4. **Tags**: Named references to specific commits

Each object is identified by a 40-character SHA-1 hash derived from its content. For example:

```bash
# This command shows the content of an object
git cat-file -p 7d9f3d4b0b7c8a9e6d5f2c1b3a7e8d9f0b1c2d3e
```

### How Objects Are Stored

Git stores these objects in the `.git/objects` directory, either as loose objects (individual files) or packed into packfiles for efficiency.

Let's look at what happens when you create a new file:

```bash
# Create a new file
echo "Hello, world!" > example.txt

# Add it to Git
git add example.txt
```

Behind the scenes, Git:
1. Calculates a hash for the file content
2. Creates a new blob object in `.git/objects/`
3. Updates the index (staging area) to include this file

When you examine the objects directory:

```bash
find .git/objects -type f | grep -v "pack" | wc -l
```

You'll see the number of loose objects has increased.

## The Problem: Accumulation of Objects

Over time, Git repositories accumulate objects that are no longer needed. Consider these scenarios:

1. **Amended commits**: When you amend a commit, the original commit becomes unreachable
2. **Reset operations**: After a hard reset, the previous HEAD commit may become unreachable
3. **Branch deletions**: Objects unique to deleted branches may become unreachable
4. **Rebasing**: Creates new commit objects, potentially making original commits unreachable

Let's demonstrate with an example:

```bash
# Create a commit
echo "Initial content" > file.txt
git add file.txt
git commit -m "Initial commit"

# Now amend that commit
echo "Updated content" > file.txt
git add file.txt
git commit --amend -m "Updated initial commit"
```

After these operations, the original commit still exists in the object database but is no longer reachable through any reference.

## Garbage Collection: Reclaiming Space

Git's garbage collection process, run via `git gc`, performs several important housekeeping tasks:

1. **Identifies unreachable objects**: Objects not reachable from any reference
2. **Packs loose objects**: Combines individual objects into packfiles
3. **Creates pack indexes**: Builds indexes for efficient object lookup
4. **Prunes unnecessary objects**: Removes unreachable objects (after a grace period)

### How Git Determines Reachability

Git uses a technique similar to mark-and-sweep garbage collection:

1. Starts from all references (branches, tags, HEAD, etc.)
2. Traverses the commit graph, marking all reachable objects
3. Any unmarked objects are candidates for pruning

Let's see a concrete example of how Git determines reachability:

```bash
# Create a simple history
echo "v1" > file.txt
git add file.txt
git commit -m "First commit"
echo "v2" > file.txt
git add file.txt
git commit -m "Second commit"

# Now create a new branch
git branch backup

# Reset the main branch to the first commit
git reset --hard HEAD~1
```

At this point, the second commit is still reachable via the `backup` branch. If we delete that branch:

```bash
git branch -D backup
```

The second commit becomes unreachable and eventually prunable.

## The Garbage Collection Process in Detail

Let's walk through what happens when you run `git gc`:

### 1. Packing Loose Objects

First, Git identifies loose objects and packs them:

```bash
# Before running gc
ls -la .git/objects/

# Run gc
git gc

# After gc
ls -la .git/objects/
```

You'll notice many loose objects are gone, replaced by pack files in `.git/objects/pack/`.

### 2. Expire Reflog Entries

Git maintains a reflog (reference log) that records changes to references:

```bash
git reflog
```

During garbage collection, old reflog entries expire based on configured time limits:

- `gc.reflogExpire`: Default is 90 days
- `gc.reflogExpireUnreachable`: Default is 30 days

### 3. Prune Unreachable Objects

Finally, Git prunes unreachable objects that exceed the grace period:

```bash
# Check what would be pruned
git prune --dry-run

# Actually prune objects
git prune
```

The grace period is crucial—it prevents removing objects that might still be needed, such as when switching between branches or fixing mistakes.

## Object Pruning: Configuration and Control

Git provides several configuration options to control pruning behavior:

### Grace Periods

```bash
# Set grace period for unreachable objects
git config gc.pruneExpire "2.weeks.ago"

# Objects younger than this will be kept even if unreachable
```

### Automatic Garbage Collection

Git may automatically run garbage collection during certain commands:

```bash
# Disable automatic gc
git config --global gc.auto 0

# Set threshold for auto-gc (default is 6700 loose objects)
git config --global gc.autoPackLimit 5000
```

## A Practical Example: Cleaning a Repository

Let's see how to clean up a repository that has grown large over time:

```bash
# Check current size
du -sh .git

# Run aggressive garbage collection
git gc --aggressive --prune=now

# Check new size
du -sh .git
```

The `--aggressive` option optimizes the repository more thoroughly (at the cost of more CPU time), while `--prune=now` removes all unreachable objects immediately.

## Protecting Objects from Pruning

Sometimes you need to keep certain objects. Git offers ways to protect objects from pruning:

1. **Create a reference**: Tag or branch pointing to the commit
2. **Add to the reflog**: Objects in the reflog are protected by the grace period
3. **Create a "keep" file**: Create empty files in `.git/objects/pack/` with the .keep extension

Example of creating a lightweight tag to protect a commit:

```bash
# Find a commit hash
git log --oneline

# Create a tag to protect it
git tag archive-point 7d9f3d4
```

## Beyond Basic Garbage Collection: Advanced Techniques

For large repositories, advanced techniques become important:

### Shallow Clones and Partial Clones

To reduce repository size:

```bash
# Create a shallow clone (limited history)
git clone --depth=1 https://github.com/example/repo.git

# Later deepen if needed
git fetch --deepen=10
```

### Repository Maintenance

Git 2.31+ introduces a dedicated maintenance command:

```bash
# Set up scheduled maintenance
git maintenance start

# Run maintenance manually
git maintenance run --task=gc
```

## Understanding the Trade-offs

Git's garbage collection involves trade-offs:

1. **Storage vs. Performance**: More frequent GC saves space but uses CPU time
2. **Safety vs. Space**: Longer grace periods are safer but use more space
3. **Accessibility vs. Size**: Full history provides more context but increases size

## Conclusion

Git's garbage collection and object pruning mechanisms maintain the health and efficiency of repositories by:

1. Identifying and removing objects that are no longer needed
2. Compressing and optimizing storage through packfiles
3. Preserving recently used objects through grace periods

Understanding these processes helps you maintain efficient repositories and troubleshoot issues related to repository size and performance.

When you work with Git, you're not just using a version control system—you're working with a sophisticated content-addressable storage system with built-in waste management that carefully balances data preservation with storage efficiency.