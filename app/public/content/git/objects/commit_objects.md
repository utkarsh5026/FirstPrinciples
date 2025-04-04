# Git Commit Objects: Snapshots of the Repository

When thinking about Git commit objects, I find it helpful to start from the absolute fundamentals. Let's build our understanding from the ground up, exploring what these objects really are and how they form the backbone of Git's version control system.

## What is a Git Commit Object, Really?

At its core, a Git commit object is a snapshot of your entire repository at a specific point in time. But it's more precise to think of it as a permanently recorded state of your project that contains:

1. A complete snapshot of all tracked files
2. Metadata about when and by whom the snapshot was created
3. A connection to its parent commit(s)

But to truly understand commit objects, we need to understand Git's underlying data model.

## Git's Content-Addressable Storage System

Git doesn't track changes between versions like some other version control systems. Instead, Git uses a content-addressable storage system where everything is stored as objects identified by their content.

When we create a commit, Git doesn't store the entire repository again. Instead, it:

1. Takes a snapshot of your working directory
2. Computes a unique identifier (SHA-1 hash) for each file
3. Stores only what has changed since the previous commit
4. Creates a commit object that points to this state

Let's break down what happens when we make a change and commit it:

```bash
echo "Hello, world!" > hello.txt
git add hello.txt
git commit -m "Add hello.txt file"
```

When we run these commands, Git:

1. Creates a blob object containing the content "Hello, world!"
2. Creates a tree object representing the directory structure
3. Creates a commit object that references the tree and contains metadata

## The Four Types of Git Objects

To understand commit objects fully, we need to understand the four types of objects in Git's database:

1. **Blobs** : Store file contents (but not filenames)
2. **Trees** : Store directory structures and file metadata
3. **Commits** : Store metadata and pointers to trees
4. **Tags** : Store references to specific commits

Let's look at the relationship between these:

```
Commit Object
├── Pointer to a tree
├── Author info
├── Committer info
├── Commit message
└── Parent commit(s)
    │
    Tree Object
    ├── Directory entries
    └── Pointers to blobs or other trees
        │
        Blob Objects
        ├── File contents
```

## Inside a Commit Object

Let's examine the actual content of a commit object. We can use `git cat-file` to see what's inside:

```bash
# First, find the hash of a commit
git log --format="%H" -n 1

# Then, examine the commit
git cat-file -p <commit-hash>
```

The output will look something like:

```
tree 7b8e2a7979c6f221638abfa7d4b79d5776344277
parent 54c9c8d96d9b99c6b68081e9313c1624e7397f7b
author John Doe <john@example.com> 1617208530 -0700
committer John Doe <john@example.com> 1617208530 -0700

Add hello.txt file
```

This shows us the essential components of a commit object:

1. **Tree pointer** : References the root directory tree at commit time
2. **Parent pointer** : References the previous commit (absent for the first commit)
3. **Author information** : Who created the changes and when
4. **Committer information** : Who committed the changes (can differ from author)
5. **Commit message** : A human-readable description of the changes

## How Git Generates Commit Hashes

Each commit is identified by a SHA-1 hash, which is a 40-character hexadecimal string. This hash is generated from the commit's content:

```
hash = SHA1(commit header + commit content)
```

Where:

* **Commit header** includes the object type and size
* **Commit content** includes tree reference, parent(s), author, committer, and message

This means that if any detail of the commit changes (even a timestamp), the hash completely changes. This property is crucial for Git's integrity.

## Example: Tracing a Commit's Relationship

Let's trace through a small repository to see how commits relate to each other:

```bash
# Create a test repository
mkdir git-example
cd git-example
git init

# First commit
echo "Hello" > file.txt
git add file.txt
git commit -m "Initial commit"

# Second commit
echo "Hello, world!" > file.txt
git add file.txt
git commit -m "Update file.txt"
```

Now let's examine the relationship:

```bash
# Get the latest commit hash
COMMIT2=$(git rev-parse HEAD)

# Examine this commit
git cat-file -p $COMMIT2
# Shows: tree <hash2>, parent <hash1>, author, committer, message

# Get the parent
COMMIT1=$(git rev-parse HEAD~1)

# Examine the parent commit
git cat-file -p $COMMIT1
# Shows: tree <hash1>, author, committer, message (no parent)

# Examine the trees
git cat-file -p <hash2>
# Shows: blob <blob2> file.txt

git cat-file -p <hash1>
# Shows: blob <blob1> file.txt

# Examine the blobs
git cat-file -p <blob2>
# Shows: Hello, world!

git cat-file -p <blob1>
# Shows: Hello
```

This example shows how commits form a chain, each pointing to its parent, and how each commit references a tree that captures the state of the repository.

## Commit Objects vs. Working Directory

It's important to distinguish between:

1. **Working directory** : Files you're currently working with
2. **Staging area (index)** : Changes staged for the next commit
3. **Repository** : Where Git stores its objects (commits, trees, blobs)

When you make a commit, Git:

1. Takes the current index (staging area)
2. Creates tree objects representing the directory structure
3. Creates blob objects for new or modified file contents
4. Creates a commit object that points to the root tree

## Merges and Multiple Parents

Most commits have one parent, but merge commits are special—they have multiple parents:

```
    C---D---E
   /         \
A---B         F
   \         /
    G---H---I
```

In this diagram, commit F is a merge commit with parents E and I. Its commit object would reference both parents:

```
tree <hash>
parent <hash-of-E>
parent <hash-of-I>
author ...
committer ...

Merge branches 'feature' and 'master'
```

## How Commit Objects Enable Git's Features

Understanding commit objects helps us understand Git's core features:

1. **Fast branching** : Branches are just pointers to commit objects
2. **Efficient storage** : Unchanged files are referenced, not duplicated
3. **Data integrity** : Content-based addressing ensures data integrity
4. **Distributed nature** : Complete history exists in each repository

For example, when you create a branch:

```bash
git branch feature
```

Git simply creates a reference to the current commit object. No files are copied.

## Practical Implications

Understanding commit objects has practical benefits:

1. **Better commit messages** : Knowing that commits are snapshots helps write clearer messages
2. **Atomic commits** : Make each commit a logical unit of work
3. **Clean history** : Understanding the commit graph helps with rebasing and merging

## Exploring Commit Objects

You can explore commit objects using these commands:

```bash
# View commit history
git log

# Show commit details
git show <commit-hash>

# List all objects
git fsck --full

# Examine object content
git cat-file -p <object-hash>

# Show the commit graph visually
git log --graph --oneline --all
```

## Git Internals: How Commits Are Stored

Git stores all objects in the `.git/objects` directory. They're stored either:

1. As loose objects (individual files)
2. In packfiles (compressed collections of objects)

For example, a commit with hash `a1b2c3...` would initially be stored at:

```
.git/objects/a1/b2c3...
```

The first two characters form the directory name, and the rest form the filename.

As your repository grows, Git periodically runs garbage collection (`git gc`), which:

1. Compresses loose objects into packfiles
2. Removes unreachable objects
3. Optimizes repository storage

## Creating a Commit Programmatically

Let's see how we might create a commit programmatically using Git's plumbing commands:

```bash
# Create a new file
echo "Content" > file.txt

# Create a blob object
blob=$(git hash-object -w file.txt)

# Create a tree with this blob
tree=$(echo "100644 blob $blob	file.txt" | git mktree)

# Create a commit pointing to this tree
commit=$(echo "Initial commit" | git commit-tree $tree)

# Update HEAD to point to this commit
git update-ref HEAD $commit
```

This demonstrates the low-level operations that happen when you run `git commit`.

## Conclusion

Git commit objects are snapshots that:

1. Capture the state of your repository at a point in time
2. Form a linked history of your project
3. Enable Git's powerful features like branching and merging

By understanding commit objects, you gain insight into Git's elegant design and can use it more effectively. Instead of viewing Git as a tool that tracks changes between files, you can understand it as a content-addressable filesystem with a version control user interface built on top.

This deeper understanding will help you make better decisions about how to structure your commits, branches, and overall workflow.
