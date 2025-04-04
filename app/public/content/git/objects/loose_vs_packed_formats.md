# Git Object Storage: Loose vs. Packed Formats

Let's explore how Git actually stores its data, starting from first principles. Understanding these storage mechanisms will give you deeper insight into Git's design philosophy and how it efficiently manages project history.

## The Foundation: Git as a Content-Addressable Filesystem

At its core, Git is a content-addressable filesystem. This means Git stores data and retrieves it based on its content, not its location. When you add content to Git, it generates a unique key based on the content itself (using SHA-1 hash), which becomes the address for retrieving that content later.

## 1. The Loose Object Format

When you first commit changes to a Git repository, Git stores each object (commit, tree, blob, tag) as an individual file. This is called the "loose object format."

### How Loose Objects Work

Let's trace what happens when you save a simple text file in Git:

1. You create a file named `hello.txt` with content "Hello, World!"
2. You stage this file with `git add hello.txt`

At this point, Git:

* Calculates the SHA-1 hash of the content: `e965047ad7c57865823c7d992b1d046ea66edf78`
* Takes the first two characters as a directory name: `e9`
* Uses the remaining characters as the filename: `65047ad7c57865823c7d992b1d046ea66edf78`
* Creates this path in `.git/objects/`: `.git/objects/e9/65047ad7c57865823c7d992b1d046ea66edf78`

### Internal Structure of a Loose Object

Let's examine the structure of a loose object:

1. Git prepends a header to your content: `blob 14\0` (where 14 is the content length and \0 is a null byte)
2. Git combines the header and content: `blob 14\0Hello, World!`
3. Git compresses this using zlib
4. The compressed data is stored in the file at the path determined by the SHA-1 hash

### Example: Tracing a File Through Git

Let's walk through what happens when we commit a simple file:

```bash
# Create a new repository
mkdir git-example
cd git-example
git init

# Create and commit a file
echo "Hello, World!" > hello.txt
git add hello.txt
```

After running `git add`, we can find our content in the `.git/objects` directory:

```bash
# Find the SHA-1 of the blob
git hash-object hello.txt
# e965047ad7c57865823c7d992b1d046ea66edf78

# Verify the object exists
ls -la .git/objects/e9/
# Should see: 65047ad7c57865823c7d992b1d046ea66edf78
```

### Advantages of Loose Objects

* **Simplicity** : Each object is a separate file, making the system conceptually simple
* **Independence** : Objects can be added or removed individually
* **Durability** : Corruption of one file affects only one object

### Disadvantages of Loose Objects

* **Filesystem Overhead** : Many small files can strain the filesystem
* **Storage Inefficiency** : Similar objects are stored separately
* **Performance Impact** : Reading many small files is slower than reading fewer large files

## 2. The Packed Object Format

As your repository grows, Git automatically optimizes storage by "packing" loose objects into more efficient packfiles through a process called "garbage collection."

### How Packfiles Work

A packfile consists of two files:

* `.pack` file: Contains all the compressed objects
* `.idx` file: An index for quickly locating objects within the pack

### The Packing Process

When Git packs objects, it:

1. Sorts objects by filename, path, and modification time to identify similar objects
2. Stores the first version of an object completely (base object)
3. For similar objects, stores only the delta (difference) from the base object
4. Compresses the entire packfile for additional space savings

Let's see an example of how this works with a small change to our file:

```bash
# Make a change to our file
echo "Hello, Git World!" > hello.txt
git add hello.txt
git commit -m "Initial commit"

# Make another change
echo "Hello, Amazing Git World!" > hello.txt
git add hello.txt
git commit -m "Update greeting"

# Force Git to pack objects
git gc
```

After running `git gc`, Git creates packfiles in `.git/objects/pack/`:

```bash
ls -la .git/objects/pack/
# Should see something like:
# pack-f8d0c86d1791d2e2f8e472e7d792a291e7c7720c.idx
# pack-f8d0c86d1791d2e2f8e472e7d792a291e7c7720c.pack
```

### Delta Compression

The key to packfiles' efficiency is delta compression. Let's understand this with a concrete example:

Imagine two versions of the same file:

* Version 1: "Hello, Git World!"
* Version 2: "Hello, Amazing Git World!"

Rather than storing both complete strings, Git stores:

* Version 1 completely: "Hello, Git World!"
* For Version 2, just the delta: "Insert 'Amazing ' at position 7"

This delta is much smaller than the full content, especially for larger files with minor changes.

### Examining Packfiles

Git provides tools to examine packfiles:

```bash
# List objects in a packfile
git verify-pack -v .git/objects/pack/pack-*.idx

# Get information about a specific object
git cat-file -p <object-hash>
```

### Benefits of Packfiles

* **Space Efficiency** : Delta compression dramatically reduces storage needs
* **Reduced Filesystem Overhead** : Fewer files to manage
* **Performance Improvement** : Reading one large file is faster than many small files
* **Network Efficiency** : Transferring packed objects requires less bandwidth

## 3. When and How Objects Get Packed

Git uses several strategies to determine when to pack objects:

### Automatic Packing

Git automatically packs objects when:

* You run `git gc` manually
* You push to a remote
* Background maintenance tasks run (if enabled)
* Certain thresholds are exceeded:
  * Too many loose objects (typically > 6700)
  * Too many packfiles (typically > 50)

### The Packing Threshold

Git uses a heuristic to decide when to pack:

```bash
# See current auto-packing settings
git config gc.auto
# Default is 6700
```

This means Git will automatically run a light garbage collection when it detects more than 6700 loose objects.

### Example: Tracking Packing Behavior

Let's observe how Git manages objects as we make changes:

```bash
# Create a new repository
git init packing-demo
cd packing-demo

# Create a script to make many commits
for i in {1..1000}; do
  echo "Line $i" >> data.txt
  git add data.txt
  git commit -m "Add line $i"
done

# Check object count before packing
find .git/objects -type f | grep -v pack | wc -l

# Run garbage collection
git gc

# Check object count after packing
find .git/objects -type f | grep -v pack | wc -l
# Should be much smaller

# Check packfile size
ls -lh .git/objects/pack/
```

## 4. Implementation Details

### Loose Object Implementation

A loose object is implemented as:

```
header + content
```

Where the header is:

```
<object type> <content length>\0
```

For example, a blob's header might be:

```
blob 42\0
```

This is then zlib-compressed and stored in the `.git/objects` directory.

### Packfile Structure

A packfile has a more complex structure:

1. **Header** :

* 4-byte signature: 'PACK'
* 4-byte version number
* 4-byte object count

1. **Object Entries** :

* Each entry starts with a type and size information byte
* For non-delta objects: the compressed data follows
* For delta objects: a reference to the base object followed by compressed delta instructions

1. **Trailer** :

* 20-byte SHA-1 checksum of the packfile contents

### Delta Encoding Format

Delta encoding uses a simple instruction format:

* Copy instructions: "Copy X bytes from position Y in the base object"
* Insert instructions: "Insert these new bytes"

For example, to change "Hello, World!" to "Hello, Git World!":

1. Copy 7 bytes from position 0 ("Hello, ")
2. Insert "Git "
3. Copy 6 bytes from position 7 ("World!")

## 5. Practical Implications

Understanding Git's storage formats has practical benefits:

### Repository Size Management

* Large binary files in Git history remain in packfiles forever, even if deleted
* Historical changes to large files create more delta chains, increasing packfile size
* Tools like Git LFS (Large File Storage) store large binaries externally

### Performance Considerations

* Repositories with many small files benefit more from packing
* Very large repositories might need more frequent garbage collection
* Clone and fetch operations transfer packfiles, not loose objects

### Corruption Recovery

* Loose objects are easier to recover individually if corrupted
* Packfile corruption can affect many objects at once
* Git's object model makes it possible to recover most objects even with some corruption

## Conclusion

Git's dual storage system—loose objects for simplicity and immediate storage, and packfiles for efficiency and long-term storage—demonstrates the thoughtful engineering behind Git. This hybrid approach gives Git both the flexibility of an object database and the efficiency needed for handling large repositories.

By understanding these formats, you gain insight into:

* Why Git repositories can be compact despite storing complete history
* How Git achieves its remarkable performance
* The trade-offs Git makes between immediate storage simplicity and long-term storage efficiency

This knowledge can help you make better decisions about repository structure, especially when dealing with large files or long-lived projects with extensive history.
