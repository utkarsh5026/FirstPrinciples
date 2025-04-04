# Git Merges at the Object Level

To understand how Git handles merges at the object level, we need to start with the fundamentals of Git's data structures and then build up to the merge process itself.

## Git's Core Data Model

At its core, Git is a content-addressable filesystem. This means Git stores data as objects that are retrievable by their content's hash. Let's begin by understanding the basic object types in Git.

### The Four Object Types

Git's object database consists of four primary types of objects:

1. **Blob objects** - Store file contents
2. **Tree objects** - Represent directories and contain pointers to blobs and other trees
3. **Commit objects** - Point to a tree and contain metadata about a commit
4. **Tag objects** - Point to a specific commit with additional metadata

Each object is stored with a SHA-1 hash of its content, which serves as its identifier. This design is crucial to understanding how Git handles merges.

Let's look at a concrete example of these objects:

```bash
# Creating a simple file
echo "Hello, world" > hello.txt

# Adding and committing the file
git add hello.txt
git commit -m "Add hello.txt"
```

Behind the scenes, Git creates:

1. A blob object containing "Hello, world"
2. A tree object pointing to this blob with the filename "hello.txt"
3. A commit object pointing to this tree with commit metadata

We can inspect these objects:

```bash
# View the commit object
git cat-file -p HEAD

# View the tree object
git cat-file -p $(git rev-parse HEAD^{tree})

# View the blob object
git cat-file -p $(git ls-tree HEAD | grep hello.txt | awk '{print $3}')
```

## The Commit Graph

Before diving into merges, we need to understand that Git maintains a directed acyclic graph (DAG) of commits. Each commit points to its parent commit(s), forming a historical record of the repository.

For a simple repository:

```
A <-- B <-- C (master)
```

Commit C points to B as its parent, B points to A, and A has no parent (it's the initial commit).

## Diverging Histories and the Need for Merges

When different developers work on the same codebase, the commit graph can diverge:

```
A <-- B <-- C (master)
      ^
      |
      D <-- E (feature)
```

Here, both branches "master" and "feature" share a common ancestor B, but then diverge with different commits. This is where merges become necessary.

## Merge Mechanics at the Object Level

When you run `git merge feature` while on the `master` branch, Git needs to combine the changes from both branches. At the object level, this involves creating new objects that represent the merged state.

### 1. Finding the Merge Base

The first step in a merge is identifying the most recent common ancestor of the two branches. This is called the "merge base." Git uses this as the reference point to determine what has changed in each branch.

```bash
# Find the merge base between master and feature
git merge-base master feature
```

In our example, B is the merge base.

### 2. The Three-Way Merge

Git performs a three-way merge using:

* The merge base (B)
* The tip of the current branch (C)
* The tip of the branch being merged in (E)

For each file that exists in any of these three states, Git needs to determine what content should appear in the merged result.

### 3. Object Creation During a Merge

Let's follow the object creation during a merge with an example:

Imagine we have:

* In commit B: hello.txt with "Hello, world"
* In commit C: hello.txt with "Hello, world!\nGoodbye, world!"
* In commit E: hello.txt with "Hello, world!\nHello, Git!"

During the merge, Git:

1. Creates a new blob object for the merged content of hello.txt: "Hello, world!\nGoodbye, world!\nHello, Git!"
2. Creates a new tree object pointing to this blob
3. Creates a merge commit object pointing to this tree and with two parents: C and E

The result is a new commit in the graph:

```
A <-- B <-- C <-- M (master)
      ^          /
      |         /
      D <-- E --' (feature)
```

Where M is the merge commit with two parent pointers.

## Merge Commit Structure

A merge commit differs from a regular commit by having multiple parent commits. Let's examine a merge commit's structure:

```bash
# Create a merge scenario
mkdir git-merge-example
cd git-merge-example
git init
echo "Initial content" > file.txt
git add file.txt
git commit -m "Initial commit"

# Create and switch to a feature branch
git branch feature
git checkout feature
echo "Feature change" >> file.txt
git commit -am "Feature change"

# Switch back to master and make a different change
git checkout master
echo "Master change" >> file.txt
git commit -am "Master change"

# Perform the merge
git merge feature -m "Merge feature into master"

# Examine the merge commit
git cat-file -p HEAD
```

The output will show a commit object with two parent commits:

```
tree 7b96cb7e5ebcfbc98e17b3a1dfbd09fe3e8b6d51
parent 8a3b5a10ef68b3960c07db1c6144384a91e38375 (master)
parent 2e3b5c8b8a9f7d4a0de3a9f7b5c0b0d5a9f8a3b5 (feature)
author John Doe <john@example.com> 1617293054 -0400
committer John Doe <john@example.com> 1617293054 -0400

Merge feature into master
```

## Resolving Merge Conflicts at the Object Level

When Git can't automatically determine how to merge changes, it declares a conflict. At the object level, this means Git can't create a new blob object without human intervention.

For conflicting files, Git:

1. Creates a special blob containing conflict markers
2. Updates the index (staging area) to indicate a conflict state
3. Waits for the user to resolve the conflict and stage the result

Let's create a conflict and observe what happens at the object level:

```bash
# Create a conflict scenario
mkdir git-conflict-example
cd git-conflict-example
git init
echo "Line 1" > conflict.txt
echo "Line 2" >> conflict.txt
git add conflict.txt
git commit -m "Initial commit"

# Create a feature branch
git branch feature
git checkout feature
sed -i 's/Line 2/Line 2 - changed in feature/' conflict.txt
git commit -am "Change Line 2 in feature"

# Switch back to master and change the same line
git checkout master
sed -i 's/Line 2/Line 2 - changed in master/' conflict.txt
git commit -am "Change Line 2 in master"

# Try to merge (this will cause a conflict)
git merge feature
```

When the conflict occurs:

1. Git creates a special version of conflict.txt with conflict markers
2. The index is updated to have multiple entries for conflict.txt in different stages
3. After resolution and staging, Git can create the final blob object

We can inspect the index during a conflict:

```bash
git ls-files --stage
```

This will show multiple entries for the same file with different stage numbers:

* Stage 1: The version in the common ancestor
* Stage 2: The version in the current branch
* Stage 3: The version in the branch being merged

## Fast-Forward Merges

A special case of merging is the "fast-forward" merge. This occurs when the current branch has not diverged from the branch being merged in.

For example:

```
A <-- B <-- C (master)
                ^
                |
                D <-- E (feature)
```

Here, all commits in `feature` build directly on top of `master`. In this case, Git simply moves the `master` pointer forward:

```
A <-- B <-- C <-- D <-- E (master, feature)
```

At the object level, no new objects are created during a fast-forward merge. Git simply updates the reference to point to the existing object.

## Recursive Merge Strategy

For complex merges involving multiple merge bases, Git uses a "recursive" merge strategy. This happens when branches have split and merged multiple times.

At the object level, Git:

1. Creates virtual merge bases by performing hypothetical merges
2. Uses these virtual merge bases to perform the actual merge

This recursive approach helps Git handle the most complex branching scenarios.

## Octopus Merge

Git can merge more than two branches simultaneously, creating what's called an "octopus merge." This creates a commit with more than two parents.

At the object level, an octopus merge:

1. Identifies merge bases between all branches
2. Creates a new tree representing the merged state
3. Creates a commit object with multiple parent pointers

However, octopus merges cannot resolve conflicts automatically. If conflicts exist, Git forces you to merge branches one at a time.

## The Reset Reference Log (reflog)

During merges, Git maintains a reference log that records how references change over time. This is crucial for understanding merge behavior and recovering from mistakes.

```bash
# View the reflog
git reflog
```

The reflog shows a history of where HEAD has pointed, including merges, allowing you to return to previous states if needed.

## Example: Tracing Object Changes During a Merge

Let's put it all together by tracing the objects before and after a merge:

```bash
# Create a repository with a simple history
mkdir git-trace-example
cd git-trace-example
git init

# Initial commit
echo "Initial content" > file.txt
git add file.txt
git commit -m "Initial commit"
INITIAL_COMMIT=$(git rev-parse HEAD)
INITIAL_TREE=$(git rev-parse HEAD^{tree})
INITIAL_BLOB=$(git ls-tree HEAD | grep file.txt | awk '{print $3}')

# Create feature branch
git branch feature
git checkout feature
echo "Feature content" >> file.txt
git commit -am "Feature change"
FEATURE_COMMIT=$(git rev-parse HEAD)
FEATURE_TREE=$(git rev-parse HEAD^{tree})
FEATURE_BLOB=$(git ls-tree HEAD | grep file.txt | awk '{print $3}')

# Back to master
git checkout master
echo "Master content" >> file.txt
git commit -am "Master change"
MASTER_COMMIT=$(git rev-parse HEAD)
MASTER_TREE=$(git rev-parse HEAD^{tree})
MASTER_BLOB=$(git ls-tree HEAD | grep file.txt | awk '{print $3}')

# Perform the merge
git merge feature -m "Merge feature into master"
MERGE_COMMIT=$(git rev-parse HEAD)
MERGE_TREE=$(git rev-parse HEAD^{tree})
MERGE_BLOB=$(git ls-tree HEAD | grep file.txt | awk '{print $3}')

# Display the objects
echo "Initial commit: $INITIAL_COMMIT"
echo "Initial tree: $INITIAL_TREE"
echo "Initial blob: $INITIAL_BLOB"
echo "Feature commit: $FEATURE_COMMIT"
echo "Feature tree: $FEATURE_TREE"
echo "Feature blob: $FEATURE_BLOB"
echo "Master commit: $MASTER_COMMIT"
echo "Master tree: $MASTER_TREE"
echo "Master blob: $MASTER_BLOB"
echo "Merge commit: $MERGE_COMMIT"
echo "Merge tree: $MERGE_TREE"
echo "Merge blob: $MERGE_BLOB"
```

This script shows that during a merge:

1. A new blob is created for the merged file content
2. A new tree is created pointing to this blob
3. A new commit is created pointing to this tree and both parent commits

## Summary

At the object level, Git merges involve:

1. Identifying a merge base (common ancestor)
2. Comparing the content at three points: base, current branch, and merging branch
3. Creating new blob objects for merged file contents
4. Creating a new tree object pointing to these blobs
5. Creating a merge commit object pointing to this tree and both parent commits

This object-level understanding explains why Git merges are both powerful and complex. Each step in the process creates immutable objects, maintaining a complete history while allowing the integration of parallel development efforts.

The beauty of Git's design is that these objects form a persistent, content-addressable database that enables efficient storage, powerful branching, and reliable merging of development histories.
