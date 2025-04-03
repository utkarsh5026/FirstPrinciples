# Git Branches: Understanding the Simple Elegance

To understand how Git stores branches, I'll start from the most fundamental elements of Git's design and build up to the complete picture of branch management.

## The Foundation: Git's Object Model

At its core, Git is a content-addressable filesystem. This means Git stores data and retrieves it based on its content rather than its location. Let's break down the basic objects Git uses:

1. **Blob objects** - These store file contents
2. **Tree objects** - These represent directories and contain pointers to blobs and other trees
3. **Commit objects** - These point to a tree (representing the project state) and contain metadata like author, message, and parent commits

When you add files to Git, it creates blobs containing the file contents, trees representing the directory structure, and finally a commit tying everything together.

Let's visualize a simple commit:

```
Commit Object (hash: a1b2c3...)
├── Author: Jane Doe <jane@example.com>
├── Message: "Initial commit"
├── Parent: None (it's the first commit)
└── Tree: d4e5f6...
    ├── README.md (blob: g7h8i9...)
    └── src/ (tree: j0k1l2...)
        └── main.js (blob: m3n4o5...)
```

## The Key Insight: References as Pointers

Now for the crucial part: **Git branches are simply lightweight references to specific commits**.

A branch in Git is literally just a file that contains the 40-character SHA-1 hash of the commit it points to. That's it! This simplicity is what makes Git branching so fast and efficient.

Let's look inside a typical branch file. If you navigate to `.git/refs/heads/main` in any Git repository, you'll find a text file containing something like:

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

That's the complete branch "data structure" - just a reference to a commit hash.

## A Concrete Example

Let's walk through a simple example to see how branches work in practice:

1. You create a new repository:
   ```bash
   $ git init my_project
   $ cd my_project
   ```

2. After adding some files and making your first commit, Git creates a reference file:
   ```bash
   $ echo "Hello World" > README.md
   $ git add README.md
   $ git commit -m "Initial commit"
   ```

   Now, let's examine what Git created:
   ```bash
   $ cat .git/refs/heads/main
   71f9d24b10224587188ae8eef4e0ddee2f5a784a
   ```

3. You create a new branch:
   ```bash
   $ git branch feature
   ```

   What happens? Git simply creates a new reference file:
   ```bash
   $ cat .git/refs/heads/feature
   71f9d24b10224587188ae8eef4e0ddee2f5a784a
   ```

   Notice it points to the same commit as main since you haven't made any new commits on this branch yet.

4. Now make a change on the feature branch:
   ```bash
   $ git checkout feature
   $ echo "// TODO: Add feature code" > feature.js
   $ git add feature.js
   $ git commit -m "Add feature file"
   ```

   Let's look at the branch references now:
   ```bash
   $ cat .git/refs/heads/feature
   a48c32d7f9b46e92c3ab8aa0e94b2e02f3e5c4b1  # New commit hash
   $ cat .git/refs/heads/main
   71f9d24b10224587188ae8eef4e0ddee2f5a784a  # Still points to the original commit
   ```

The reference file for `feature` now points to your new commit, while `main` still points to the original commit.

## How Git Updates Branch References

When you commit changes on a branch, Git:

1. Creates new blob objects for the changed files
2. Creates new tree objects to represent the current directory structure
3. Creates a new commit object pointing to the new tree
4. **Updates the branch reference file to contain the new commit's hash**

It's this last step that makes Git branches so lightweight - updating a branch is just changing the contents of a small text file.

## Special Reference: HEAD

Git uses a special reference called `HEAD` to track which branch you're currently on. In most cases, `HEAD` is a symbolic reference to a branch rather than directly to a commit.

Let's look at HEAD:

```bash
$ cat .git/HEAD
ref: refs/heads/feature
```

This tells Git that `HEAD` is pointing to the `feature` branch. When you run `git checkout main`, Git updates `HEAD` to point to `main` instead:

```bash
$ git checkout main
$ cat .git/HEAD
ref: refs/heads/main
```

## Packed References

For repositories with many branches and tags, Git sometimes optimizes by storing multiple references in a single file called `packed-refs`. This reduces filesystem operations.

A `packed-refs` file might look like:

```
# pack-refs with: peeled fully-peeled sorted 
71f9d24b10224587188ae8eef4e0ddee2f5a784a refs/heads/main
a48c32d7f9b46e92c3ab8aa0e94b2e02f3e5c4b1 refs/heads/feature
b59a31c7f9c46e92c3ab8aa0e94b2e02f3e5c8d6 refs/tags/v1.0
```

In this case, Git will look for a branch in `.git/refs/heads/` first, and if it doesn't find it there, it consults the `packed-refs` file.

## Remote-Tracking Branches

Git also maintains references to branches on remote repositories. These are stored in `.git/refs/remotes/<remote-name>/`:

```bash
$ cat .git/refs/remotes/origin/main
71f9d24b10224587188ae8eef4e0ddee2f5a784a
```

These files work exactly the same way as local branches, but Git treats them as read-only. They're updated when you fetch from a remote.

## Under the Hood: Moving a Branch

When you use commands that move branches, like `git branch -f main HEAD~3`, Git is simply:

1. Looking up the commit object at HEAD~3
2. Writing that commit's hash to the `.git/refs/heads/main` file

```bash
# Before
$ cat .git/refs/heads/main
71f9d24b10224587188ae8eef4e0ddee2f5a784a

# Run command
$ git branch -f main HEAD~3

# After
$ cat .git/refs/heads/main
436f7e0e2f3c8b9a7d6e5c4b3a2f1e0d9c8b7a6
```

## The Plumbing Command: update-ref

Git provides low-level "plumbing" commands that reveal how it works internally. The `update-ref` command directly manipulates references:

```bash
$ git update-ref refs/heads/experimental a48c32d7f9b46e92c3ab8aa0e94b2e02f3e5c4b1
```

This creates or updates the `experimental` branch to point to the specified commit, without having to check it out first.

## Practical Implications of This Design

Understanding that branches are just simple reference files has several practical implications:

1. **Branches are lightweight** - Creating a branch is just creating a 41-byte file (40 characters + newline)
2. **Branch operations are fast** - No copying of data, just updating references
3. **Multiple branches can point to the same commit** - Just different files with the same content
4. **Deleting a branch is safe** - It just removes the reference file, not any commits
5. **Branch names are flexible** - Any valid filename can be a branch name (with a few exceptions)

## Example: Examining Branch Structure in a Real Repository

Let's look at what happens in a slightly more complex scenario:

```bash
# Create a repo with multiple branches
$ git init branch-demo
$ cd branch-demo
$ echo "Initial content" > file.txt
$ git add file.txt
$ git commit -m "Initial commit"

# Create two branches
$ git branch feature1
$ git branch feature2

# Make changes on feature1
$ git checkout feature1
$ echo "Feature 1 content" >> file.txt
$ git commit -am "Add feature 1"

# Make changes on feature2
$ git checkout feature2
$ echo "Feature 2 content" >> file.txt
$ git commit -am "Add feature 2"
```

Now we can examine the branch reference files:

```bash
$ find .git/refs/heads -type f | xargs cat
# main
c7824e2b56e4d3f6b0cb671c2e3f8e6f1d2b8a9c

# feature1
e8f7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9

# feature2 
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

Each branch points to a different commit, but they all share the history up to the initial commit.

## Conclusion

Git's branch design exemplifies the beauty of simple solutions to complex problems. By representing branches as mere pointers (reference files containing commit hashes), Git achieves remarkable efficiency while maintaining flexibility.

When you understand that branches are just files containing commit references, many Git operations become more intuitive:
- Creating branches is cheap
- Merging branches is about creating a new commit and moving the target branch reference
- Deleting branches only removes the reference, not the commit history
- Git's branching model enables powerful workflows while maintaining performance

This file-based reference system is a perfect example of Git's philosophy: a content-addressable filesystem with a version control system built on top. The simplicity of this approach enables Git's distributed nature and has helped make it the dominant version control system today.