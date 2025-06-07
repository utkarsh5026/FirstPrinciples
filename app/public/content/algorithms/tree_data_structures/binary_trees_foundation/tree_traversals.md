# Tree Traversals: A Complete Guide from First Principles

## Understanding the Foundation: What is a Tree?

Before diving into traversals, let's establish the fundamental concepts from the ground up.

> **A tree is a hierarchical data structure consisting of nodes connected by edges, where each node can have zero or more children, and there's exactly one path between any two nodes.**

Think of a family tree or an organizational chart - this is exactly how computer science trees work. Every tree has:

* **Root** : The topmost node (like the CEO in an org chart)
* **Parent** : A node that has children below it
* **Child** : A node connected below another node
* **Leaf** : A node with no children (the bottom-most nodes)

```
     A     ← Root
   /   \
  B     C   ← A's children
 / \   /
D   E F     ← Leaf nodes
```

## What is Tree Traversal?

> **Tree traversal is the process of visiting every node in a tree exactly once in a systematic way.**

Imagine you're a mail carrier who needs to visit every house in a neighborhood that's structured like a tree. You need a systematic approach to ensure you visit every house exactly once without missing any or visiting the same house twice.

## Why Do We Need Different Traversal Methods?

Different traversal methods serve different purposes:

* **Processing data in specific orders** (like printing a directory structure)
* **Evaluating mathematical expressions** (like `(2 + 3) * 4`)
* **Creating copies of trees**
* **Searching for specific values**

## The Three Main Traversal Types

There are three fundamental ways to traverse a tree, each defined by **when you process the current node** relative to its children:

1. **Preorder** : Process current → Go left → Go right
2. **Inorder** : Go left → Process current → Go right
3. **Postorder** : Go left → Go right → Process current

Let's understand each one in detail.

---

## 1. Preorder Traversal: "Root First"

> **Preorder traversal processes the current node BEFORE visiting its children.**

### The Mental Model

Think of it as exploring a building where you  **check each room as soon as you enter it** , then explore all the rooms connected to it.

```
     1     ← Visit this first
   /   \
  2     3   ← Then visit these
 / \   /
4   5 6     ← Finally visit these
```

 **Visit order** : 1 → 2 → 4 → 5 → 3 → 6

### Real-World Analogy

Imagine you're organizing files in a folder structure and want to  **create a backup** . You'd process each folder as soon as you encounter it, then dive into its subfolders.

### Recursive Implementation

```javascript
function preorderRecursive(root) {
    if (!root) return [];
  
    const result = [];
  
    // Step 1: Process current node
    result.push(root.val);
  
    // Step 2: Recursively traverse left subtree
    result.push(...preorderRecursive(root.left));
  
    // Step 3: Recursively traverse right subtree
    result.push(...preorderRecursive(root.right));
  
    return result;
}
```

**Code Explanation:**

* **Line 2** : Base case - if node is null, return empty array
* **Line 5** : Process current node first (this is what makes it "preorder")
* **Line 8** : Recursively visit left subtree, spreading results into our array
* **Line 11** : Recursively visit right subtree, spreading results into our array

### Iterative Implementation

```javascript
function preorderIterative(root) {
    if (!root) return [];
  
    const result = [];
    const stack = [root];  // Use stack to simulate recursion
  
    while (stack.length > 0) {
        // Pop node from stack
        const current = stack.pop();
      
        // Process current node immediately
        result.push(current.val);
      
        // Push children (RIGHT first, then LEFT)
        // This ensures LEFT is processed first due to LIFO
        if (current.right) stack.push(current.right);
        if (current.left) stack.push(current.left);
    }
  
    return result;
}
```

**Code Explanation:**

* **Line 4** : Initialize stack with root node
* **Line 7** : Continue until stack is empty
* **Line 9** : Pop node from stack (LIFO - Last In, First Out)
* **Line 12** : Process node immediately (preorder characteristic)
* **Lines 16-17** : Push right child first, then left child, so left gets processed first

> **Key Insight** : We push the right child before the left child because stacks are LIFO (Last In, First Out). This ensures the left child is processed before the right child.

---

## 2. Inorder Traversal: "Left, Root, Right"

> **Inorder traversal processes the current node BETWEEN visiting its left and right children.**

### The Mental Model

Think of reading a book where you must  **read all footnotes on the left page, then the main text, then all footnotes on the right page** .

```
     4     ← Visit this third
   /   \
  2     6   ← Visit 2 second, 6 fifth
 / \   /
1   3 5     ← Visit these: 1st, 4th, 6th
```

 **Visit order** : 1 → 2 → 3 → 4 → 5 → 6

### Real-World Significance

> **For Binary Search Trees (BSTs), inorder traversal gives you nodes in sorted order!**

This is incredibly powerful for problems involving BSTs in FAANG interviews.

### Recursive Implementation

```javascript
function inorderRecursive(root) {
    if (!root) return [];
  
    const result = [];
  
    // Step 1: Recursively traverse left subtree
    result.push(...inorderRecursive(root.left));
  
    // Step 2: Process current node
    result.push(root.val);
  
    // Step 3: Recursively traverse right subtree
    result.push(...inorderRecursive(root.right));
  
    return result;
}
```

**Code Explanation:**

* **Line 6** : First, completely traverse left subtree
* **Line 9** : Then process current node (this makes it "inorder")
* **Line 12** : Finally, traverse right subtree

### Iterative Implementation

```javascript
function inorderIterative(root) {
    const result = [];
    const stack = [];
    let current = root;
  
    while (current || stack.length > 0) {
        // Go as far left as possible
        while (current) {
            stack.push(current);
            current = current.left;
        }
      
        // Process the leftmost unprocessed node
        current = stack.pop();
        result.push(current.val);
      
        // Move to right subtree
        current = current.right;
    }
  
    return result;
}
```

**Code Explanation:**

* **Lines 6-9** : Keep going left and pushing nodes onto stack
* **Line 12** : Pop the leftmost unprocessed node
* **Line 13** : Process it (add to result)
* **Line 16** : Move to its right subtree

> **The Pattern** : Go left as much as possible, process the node, then go right. This naturally gives us the left-root-right order.

---

## 3. Postorder Traversal: "Children First"

> **Postorder traversal processes the current node AFTER visiting both its children.**

### The Mental Model

Think of **deleting files in a directory structure** - you must delete all files in subdirectories before you can delete the parent directory.

```
     6     ← Visit this last
   /   \
  3     5   ← Visit these: 3rd and 5th
 / \   /
1   2 4     ← Visit these first: 1st, 2nd, 4th
```

 **Visit order** : 1 → 2 → 3 → 4 → 5 → 6

### Real-World Applications

* **Calculating directory sizes** (need to know children sizes first)
* **Deleting trees** (delete children before parent)
* **Evaluating mathematical expressions** in certain contexts

### Recursive Implementation

```javascript
function postorderRecursive(root) {
    if (!root) return [];
  
    const result = [];
  
    // Step 1: Recursively traverse left subtree
    result.push(...postorderRecursive(root.left));
  
    // Step 2: Recursively traverse right subtree
    result.push(...postorderRecursive(root.right));
  
    // Step 3: Process current node LAST
    result.push(root.val);
  
    return result;
}
```

**Code Explanation:**

* **Line 6** : First, completely traverse left subtree
* **Line 9** : Then, completely traverse right subtree
* **Line 12** : Finally, process current node (this makes it "postorder")

### Iterative Implementation

```javascript
function postorderIterative(root) {
    if (!root) return [];
  
    const result = [];
    const stack = [root];
    const lastVisited = null;
  
    while (stack.length > 0) {
        const current = stack[stack.length - 1]; // Peek, don't pop
      
        // If leaf node or both children already processed
        if (!current.left && !current.right || 
            lastVisited && (lastVisited === current.left || lastVisited === current.right)) {
          
            result.push(current.val);
            lastVisited = stack.pop();
        } else {
            // Push children onto stack (right first, then left)
            if (current.right) stack.push(current.right);
            if (current.left) stack.push(current.left);
        }
    }
  
    return result;
}
```

**Code Explanation:**

* **Line 8** : Peek at top of stack without removing it
* **Lines 11-12** : Check if it's a leaf OR both children are already processed
* **Line 14** : If ready to process, add to result and mark as visited
* **Lines 17-18** : Otherwise, push children to stack for later processing

---

## Complete Working Example

Let's trace through all three traversals on the same tree:

```javascript
// Tree Node definition
class TreeNode {
    constructor(val, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

// Building the tree:     4
//                       / \
//                      2   6
//                     / \ /
//                    1  3 5

const root = new TreeNode(4);
root.left = new TreeNode(2);
root.right = new TreeNode(6);
root.left.left = new TreeNode(1);
root.left.right = new TreeNode(3);
root.right.left = new TreeNode(5);

// Testing all traversals
console.log("Preorder:", preorderRecursive(root));   // [4, 2, 1, 3, 6, 5]
console.log("Inorder:", inorderRecursive(root));     // [1, 2, 3, 4, 5, 6]
console.log("Postorder:", postorderRecursive(root)); // [1, 3, 2, 5, 6, 4]
```

## Visual Trace of Each Traversal

### Preorder (4, 2, 1, 3, 6, 5):

```
Step 1: Visit 4 ✓
Step 2: Go left to 2, visit 2 ✓
Step 3: Go left to 1, visit 1 ✓
Step 4: Back to 2, go right to 3, visit 3 ✓
Step 5: Back to 4, go right to 6, visit 6 ✓
Step 6: From 6, go left to 5, visit 5 ✓
```

### Inorder (1, 2, 3, 4, 5, 6):

```
Step 1: Go left to leftmost (1), visit 1 ✓
Step 2: Back to parent (2), visit 2 ✓
Step 3: Go right from 2 to 3, visit 3 ✓
Step 4: Back to root (4), visit 4 ✓
Step 5: Go right to 6, but first go to its left child 5, visit 5 ✓
Step 6: Back to 6, visit 6 ✓
```

### Postorder (1, 3, 2, 5, 6, 4):

```
Step 1: Go to leftmost leaf (1), visit 1 ✓
Step 2: Go to rightmost leaf of left subtree (3), visit 3 ✓
Step 3: Now can visit their parent (2), visit 2 ✓
Step 4: Go to leftmost leaf of right subtree (5), visit 5 ✓
Step 5: Now can visit its parent (6), visit 6 ✓
Step 6: Finally can visit root (4), visit 4 ✓
```

---

## FAANG Interview Insights

> **Time Complexity** : All traversals are O(n) where n is the number of nodes
> **Space Complexity** :
>
> * Recursive: O(h) where h is the height of the tree (call stack)
> * Iterative: O(h) for the explicit stack

### Common Interview Questions:

1. **"Print/return all nodes in [specific] order"** - Direct traversal application
2. **"Validate a BST"** - Use inorder traversal to check if result is sorted
3. **"Create a copy of the tree"** - Use preorder traversal
4. **"Calculate size of each subtree"** - Use postorder traversal
5. **"Serialize/deserialize a tree"** - Often uses preorder

### Pro Tips for Interviews:

1. **Always clarify which traversal** the interviewer wants
2. **Ask about the tree type** - BST vs general binary tree matters
3. **Consider both recursive and iterative** approaches
4. **Practice drawing the traversal order** for visual problems
5. **Remember the inorder property** for BSTs - it's frequently tested

> **Master these three traversals and you'll have the foundation for solving 80% of tree problems in technical interviews!**

The key is understanding that each traversal answers the question: "When do I process the current node relative to its children?" Once you internalize this concept, implementing any traversal becomes straightforward.
