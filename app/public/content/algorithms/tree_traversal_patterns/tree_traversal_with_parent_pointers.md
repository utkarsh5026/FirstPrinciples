# Tree Traversal with Parent Pointers: A Deep Dive for FAANG Interviews

## Understanding Trees from First Principles

Before we dive into parent pointers, let's establish what a tree actually *is* at its most fundamental level.

> **Core Concept** : A tree is a hierarchical data structure that consists of nodes connected by edges, where each node can have zero or more children, but exactly one parent (except for the root node, which has no parent).

Think of a family tree or an organizational chart - that's exactly how computer science trees work. Each person (node) has children below them and one parent above them.

### Basic Tree Structure

```javascript
// Standard tree node without parent pointer
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
        // Notice: NO parent pointer yet
    }
}
```

**What's happening here?**

* We create a simple node that can store a value
* It has references to left and right children
* But it has NO way to go "upward" to its parent

Let's visualize a simple tree:

```
       1
      / \
     2   3
    / \
   4   5
```

In this tree:

* Node 1 is the root (no parent)
* Node 2 has parent 1, children 4 and 5
* Node 4 has parent 2, no children (leaf node)

## What Are Parent Pointers?

> **Parent Pointer** : An additional reference in each node that points directly to its parent node, enabling upward traversal in the tree.

### Why Parent Pointers Matter

In a standard tree, if you're at node 4, you have NO way to get back to node 2 (its parent) without traversing from the root again. Parent pointers solve this by giving each node a direct "highway" back to its parent.

```javascript
// Enhanced tree node WITH parent pointer
class TreeNodeWithParent {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
        this.parent = null; // The game-changer!
    }
}
```

**What this enables:**

* Direct upward movement: `node.parent`
* Finding ancestors without root traversal
* Efficient path finding between any two nodes
* Space-efficient algorithms in certain scenarios

## Tree Traversal: The Foundation

Tree traversal means visiting every node in the tree in a specific order. There are several standard patterns:

### 1. Depth-First Search (DFS) Patterns

**Inorder Traversal** (Left → Root → Right):

```javascript
function inorderTraversal(root, result = []) {
    if (!root) return result;
  
    // Step 1: Visit left subtree
    inorderTraversal(root.left, result);
  
    // Step 2: Process current node
    result.push(root.val);
  
    // Step 3: Visit right subtree
    inorderTraversal(root.right, result);
  
    return result;
}
```

**Why this order?** For binary search trees, inorder traversal gives you nodes in sorted order!

**Preorder Traversal** (Root → Left → Right):

```javascript
function preorderTraversal(root, result = []) {
    if (!root) return result;
  
    // Process root first
    result.push(root.val);
    preorderTraversal(root.left, result);
    preorderTraversal(root.right, result);
  
    return result;
}
```

 **Use case** : Creating a copy of the tree (you need the parent before creating children).

## How Parent Pointers Transform Traversal

With parent pointers, we can traverse trees in completely new ways that are impossible with standard trees.

### Morris Traversal with Parent Pointers

> **Key Insight** : Parent pointers allow us to traverse without recursion OR a stack, achieving O(1) space complexity!

```javascript
function inorderWithParent(root) {
    if (!root) return [];
  
    let result = [];
    let current = root;
  
    // Find the leftmost node (starting point for inorder)
    while (current.left) {
        current = current.left;
    }
  
    while (current) {
        // Process current node
        result.push(current.val);
      
        if (current.right) {
            // Move to right subtree
            current = current.right;
            // Find leftmost in right subtree
            while (current.left) {
                current = current.left;
            }
        } else {
            // No right child, go up until we find a parent
            // where current is the left child
            while (current.parent && current.parent.right === current) {
                current = current.parent;
            }
            current = current.parent;
        }
    }
  
    return result;
}
```

**What's happening step by step:**

1. Start at leftmost node (smallest in BST)
2. Process current node
3. If right child exists, go there and find its leftmost descendant
4. If no right child, go up until we find an ancestor we haven't processed
5. Repeat until we've processed all nodes

## FAANG Interview Patterns with Parent Pointers

### Pattern 1: Finding Successors and Predecessors

> **Successor** : The next node in inorder traversal
> **Predecessor** : The previous node in inorder traversal

```javascript
function findInorderSuccessor(node) {
    if (!node) return null;
  
    // Case 1: Node has right subtree
    if (node.right) {
        // Successor is leftmost node in right subtree
        let current = node.right;
        while (current.left) {
            current = current.left;
        }
        return current;
    }
  
    // Case 2: No right subtree - go up
    let current = node;
    while (current.parent && current.parent.right === current) {
        current = current.parent;
    }
  
    return current.parent;
}
```

 **Interview Question** : "Given a BST node with parent pointers, find its inorder successor."

**Solution breakdown:**

* If the node has a right child, the successor is the leftmost node in the right subtree
* If no right child, go up until you find a parent where you came from the left

### Pattern 2: Lowest Common Ancestor (LCA)

```javascript
function findLCA(node1, node2) {
    // Get all ancestors of node1
    let ancestors = new Set();
    let current = node1;
  
    while (current) {
        ancestors.add(current);
        current = current.parent;
    }
  
    // Find first common ancestor starting from node2
    current = node2;
    while (current) {
        if (ancestors.has(current)) {
            return current;
        }
        current = current.parent;
    }
  
    return null; // No common ancestor (shouldn't happen in valid tree)
}
```

**Why this works:**

1. We collect all ancestors of the first node
2. We walk up from the second node until we find a node that's also an ancestor of the first
3. That's our LCA!

### Pattern 3: Distance Between Nodes

```javascript
function findDistance(node1, node2) {
    let lca = findLCA(node1, node2);
  
    // Calculate distance from node1 to LCA
    let dist1 = 0;
    let current = node1;
    while (current !== lca) {
        dist1++;
        current = current.parent;
    }
  
    // Calculate distance from node2 to LCA
    let dist2 = 0;
    current = node2;
    while (current !== lca) {
        dist2++;
        current = current.parent;
    }
  
    return dist1 + dist2;
}
```

## Advanced Interview Pattern: Tree to Doubly Linked List

> **Classic FAANG Question** : "Convert a BST to a sorted doubly linked list using only the existing node structure."

```javascript
function treeToDoublyList(root) {
    if (!root) return null;
  
    let head = null;
    let prev = null;
  
    function inorder(node) {
        if (!node) return;
      
        // Process left subtree
        inorder(node.left);
      
        // Process current node
        if (prev) {
            // Link previous node to current
            prev.right = node;
            node.left = prev;
        } else {
            // First node becomes head
            head = node;
        }
        prev = node;
      
        // Process right subtree
        inorder(node.right);
    }
  
    inorder(root);
  
    // Make it circular
    if (head && prev) {
        head.left = prev;
        prev.right = head;
    }
  
    return head;
}
```

**Detailed explanation:**

1. We use inorder traversal to visit nodes in sorted order
2. As we visit each node, we link it to the previous node
3. We reuse `left` and `right` pointers as `prev` and `next` in the linked list
4. Finally, we make it circular by connecting head and tail

## Building Trees with Parent Pointers

```javascript
function insertWithParent(root, val) {
    const newNode = new TreeNodeWithParent(val);
  
    if (!root) return newNode;
  
    let current = root;
    while (true) {
        if (val < current.val) {
            if (!current.left) {
                current.left = newNode;
                newNode.parent = current; // Set parent pointer!
                break;
            }
            current = current.left;
        } else {
            if (!current.right) {
                current.right = newNode;
                newNode.parent = current; // Set parent pointer!
                break;
            }
            current = current.right;
        }
    }
  
    return root;
}
```

 **Critical insight** : Whenever we create parent-child relationships, we must update BOTH directions!

## Complexity Analysis

> **Space Complexity Trade-off** : Parent pointers use O(n) extra space but can eliminate the need for recursion stacks or explicit stacks in many algorithms.

| Operation         | Standard Tree         | With Parent Pointers  |
| ----------------- | --------------------- | --------------------- |
| Find Successor    | O(h) time, O(h) space | O(h) time, O(1) space |
| Find LCA          | O(h) time, O(h) space | O(h) time, O(h) space |
| Inorder Traversal | O(n) time, O(h) space | O(n) time, O(1) space |

Where `h` is the height of the tree, and `n` is the number of nodes.

## Interview Strategy and Tips

> **FAANG Interview Tip** : Always ask if the tree has parent pointers! It completely changes the optimal approach for many problems.

### When Parent Pointers Are Crucial:

1. **Successor/Predecessor problems** : Nearly always more efficient
2. **Path-related questions** : Finding paths between nodes
3. **Space-constrained problems** : When you can't use recursion
4. **Iterative traversals** : When recursion isn't allowed

### Red Flags in Interviews:

* If you're using a stack for traversal and parent pointers are available
* If you're doing multiple root-to-node traversals
* If your space complexity is O(h) when it could be O(1)

### Problem-Solving Framework:

1. **Identify if parent pointers help** : Can I move upward efficiently?
2. **Choose traversal direction** : Bottom-up often more efficient with parent pointers
3. **Consider space optimization** : Can parent pointers eliminate auxiliary space?
4. **Handle edge cases** : What if there's no parent? What about the root?

Parent pointers transform tree problems from complex recursive solutions into elegant iterative ones. They're particularly powerful in FAANG interviews because they demonstrate deep understanding of data structure optimization and space-time trade-offs.

The key insight is that parent pointers don't just add functionality—they fundamentally change how we think about tree traversal, moving from "always start at root" to "start wherever makes sense and navigate efficiently."
