# Trie (Prefix Tree): From First Principles to FAANG Interview Mastery

Let me take you on a comprehensive journey through one of the most elegant data structures in computer science - the Trie, also known as a prefix tree.

## What is a Trie? Understanding from Ground Zero

> **Core Concept** : A Trie is a tree-like data structure that stores strings in a way that allows for extremely fast prefix-based operations. Think of it as a digital dictionary where each path from root to leaf spells out a word.

Imagine you're building a physical filing system for words. Instead of storing each word as a complete unit, you break them down letter by letter, creating branches for each possible next character. This is exactly what a Trie does digitally.

### Why Do We Need Tries? The Motivation

Before diving into implementation, let's understand why Tries exist by examining the limitations of simpler approaches:

 **Problem** : You need to store 10,000 words and frequently check:

* Does a word exist?
* What words start with "pre"?
* Auto-complete suggestions

 **Naive Approaches and Their Issues** :

```javascript
// Approach 1: Array of strings
const words = ["apple", "app", "application", "apply"];

// Searching requires O(n*m) where n=number of words, m=average length
function search(word) {
    return words.includes(word); // Inefficient!
}
```

> **Key Insight** : With arrays, every search operation requires checking potentially every word in the dictionary. For large datasets, this becomes prohibitively slow.

## The Trie Structure: Building Blocks

### Node Architecture

Every Trie is built from nodes, and understanding the node structure is crucial:

```javascript
class TrieNode {
    constructor() {
        // Map to store child nodes for each character
        this.children = new Map();
      
        // Boolean flag to mark end of a valid word
        this.isEndOfWord = false;
      
        // Optional: store the character (useful for debugging)
        this.char = null;
    }
}
```

**Why this structure?**

* `children`: A Map allows O(1) access to child nodes
* `isEndOfWord`: Distinguishes between prefixes and complete words
* `char`: Helps with debugging and certain algorithms

### Visual Representation

Let's visualize how words are stored. Consider inserting "CAT", "CAR", "CARD":

```
        ROOT
         |
         C
         |
         A
        / \
       T   R
       |   |
      (T) (R)
           |
           D
           |
          (D)
```

> **Important** : Parentheses () indicate `isEndOfWord = true`. This means "CAT", "CAR", and "CARD" are all valid words, but "CA" is just a prefix.

## Core Trie Implementation

Let's build a complete Trie class step by step:

```javascript
class Trie {
    constructor() {
        // Every Trie starts with an empty root node
        this.root = new TrieNode();
    }
  
    // Insert a word into the Trie
    insert(word) {
        // Start traversal from root
        let currentNode = this.root;
      
        // Process each character in the word
        for (let char of word.toLowerCase()) {
            // If path doesn't exist, create it
            if (!currentNode.children.has(char)) {
                currentNode.children.set(char, new TrieNode());
            }
          
            // Move to the child node
            currentNode = currentNode.children.get(char);
        }
      
        // Mark the end of this word
        currentNode.isEndOfWord = true;
    }
}
```

 **Code Breakdown** :

1. **Root Initialization** : Every Trie needs a starting point
2. **Character Processing** : We traverse character by character
3. **Path Creation** : Create nodes only when needed (lazy initialization)
4. **Word Marking** : `isEndOfWord` distinguishes complete words from prefixes

### Search Operations

```javascript
// Check if a word exists in the Trie
search(word) {
    let currentNode = this.root;
  
    // Traverse the path for this word
    for (let char of word.toLowerCase()) {
        if (!currentNode.children.has(char)) {
            return false; // Path doesn't exist
        }
        currentNode = currentNode.children.get(char);
    }
  
    // Word exists only if we end at a marked node
    return currentNode.isEndOfWord;
}

// Check if any word starts with given prefix
startsWith(prefix) {
    let currentNode = this.root;
  
    // Try to follow the prefix path
    for (let char of prefix.toLowerCase()) {
        if (!currentNode.children.has(char)) {
            return false; // Prefix doesn't exist
        }
        currentNode = currentNode.children.get(char);
    }
  
    // If we can follow the entire prefix path, it exists
    return true;
}
```

> **Critical Difference** : `search()` requires `isEndOfWord = true`, while `startsWith()` only needs the path to exist.

## Advanced Operations for FAANG Interviews

### 1. Delete Operation (Tricky!)

Deletion is the most complex Trie operation because we must avoid breaking other words:

```javascript
delete(word) {
    this._deleteHelper(this.root, word.toLowerCase(), 0);
}

_deleteHelper(node, word, index) {
    // Base case: reached end of word
    if (index === word.length) {
        // Only delete if this was actually a word
        if (!node.isEndOfWord) return false;
      
        node.isEndOfWord = false;
      
        // Delete node only if it has no children
        return node.children.size === 0;
    }
  
    const char = word[index];
    const childNode = node.children.get(char);
  
    // Character path doesn't exist
    if (!childNode) return false;
  
    // Recursively delete from child
    const shouldDeleteChild = this._deleteHelper(childNode, word, index + 1);
  
    if (shouldDeleteChild) {
        node.children.delete(char);
      
        // Delete current node if:
        // 1. It's not end of another word
        // 2. It has no other children
        return !node.isEndOfWord && node.children.size === 0;
    }
  
    return false;
}
```

**Why is deletion complex?**

* We can't just remove nodes - other words might share prefixes
* Must carefully check if a node is safe to delete
* Requires recursive backtracking

### 2. Auto-Complete Implementation

This is a favorite FAANG interview question:

```javascript
// Get all words that start with given prefix
getWordsWithPrefix(prefix) {
    const result = [];
    let currentNode = this.root;
  
    // Navigate to the prefix node
    for (let char of prefix.toLowerCase()) {
        if (!currentNode.children.has(char)) {
            return result; // No words with this prefix
        }
        currentNode = currentNode.children.get(char);
    }
  
    // Collect all words from this point
    this._collectWords(currentNode, prefix, result);
    return result;
}

_collectWords(node, currentWord, result) {
    // If this node marks end of word, add it to results
    if (node.isEndOfWord) {
        result.push(currentWord);
    }
  
    // Explore all children
    for (let [char, childNode] of node.children) {
        this._collectWords(childNode, currentWord + char, result);
    }
}
```

## FAANG Interview Applications

### 1. Word Search II (LeetCode Hard)

> **Problem** : Given a 2D board and a list of words, find all words that exist in the board.

 **Why Trie is Perfect** :

* Instead of searching for each word individually (expensive)
* Build a Trie of all words, then traverse board once

```javascript
// Key insight: Use Trie to prune search space
function findWords(board, words) {
    const trie = new Trie();
    const result = [];
  
    // Build Trie from word list
    for (let word of words) {
        trie.insert(word);
    }
  
    // DFS from each cell
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            dfs(board, i, j, trie.root, "", result);
        }
    }
  
    return result;
}

function dfs(board, row, col, node, path, result) {
    // Boundary and visited checks
    if (row < 0 || row >= board.length || 
        col < 0 || col >= board[0].length || 
        board[row][col] === '#') return;
  
    const char = board[row][col];
    if (!node.children.has(char)) return; // No words possible
  
    node = node.children.get(char);
    path += char;
  
    // Found a word!
    if (node.isEndOfWord) {
        result.push(path);
        node.isEndOfWord = false; // Avoid duplicates
    }
  
    // Mark visited
    board[row][col] = '#';
  
    // Explore 4 directions
    dfs(board, row + 1, col, node, path, result);
    dfs(board, row - 1, col, node, path, result);
    dfs(board, row, col + 1, node, path, result);
    dfs(board, row, col - 1, node, path, result);
  
    // Unmark
    board[row][col] = char;
}
```

### 2. Search Suggestions System

> **Problem** : Implement a search autocomplete system that returns top 3 suggestions for each prefix.

```javascript
class SearchSuggestions {
    constructor(products) {
        this.trie = new Trie();
      
        // Sort products first for lexicographical order
        products.sort();
      
        // Insert all products
        for (let product of products) {
            this.trie.insert(product);
        }
    }
  
    suggestedProducts(searchWord) {
        const result = [];
        let prefix = "";
      
        for (let char of searchWord) {
            prefix += char;
            const suggestions = this.trie.getWordsWithPrefix(prefix);
          
            // Return only top 3 suggestions
            result.push(suggestions.slice(0, 3));
        }
      
        return result;
    }
}
```

## Time and Space Complexity Analysis

> **Time Complexities** :
>
> * **Insert** : O(m) where m is length of word
> * **Search** : O(m) where m is length of word
> * **Delete** : O(m) where m is length of word
> * **Prefix Search** : O(p + n) where p is prefix length, n is number of matching words

> **Space Complexity** : O(ALPHABET_SIZE * N * M) where N is number of words and M is average length

 **Why Tries are Efficient** :

* No string comparisons needed
* Shared prefixes save space
* Early termination for non-existent prefixes

## Memory Optimization Techniques

### Compressed Trie (Patricia Tree)

For memory-critical applications:

```javascript
class CompressedTrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.edgeLabel = ""; // Store multiple characters
    }
}
```

This reduces nodes by combining chains of single-child nodes.

## Common Interview Pitfalls and How to Avoid Them

> **Pitfall 1** : Forgetting case sensitivity
> **Solution** : Always normalize input (typically to lowercase)

> **Pitfall 2** : Not handling empty strings
> **Solution** : Add explicit checks for edge cases

> **Pitfall 3** : Incorrect deletion logic
> **Solution** : Remember that prefixes can be shared between words

## Practice Problems for Mastery

1. **Word Break** - Check if string can be segmented using dictionary
2. **Replace Words** - Replace words with their shortest root
3. **Design Add and Search Words Data Structure** - Handle wildcards
4. **Palindrome Pairs** - Find pairs of words that form palindromes

The Trie is more than just a data structure - it's a powerful tool for solving complex string problems efficiently. Master these concepts, and you'll be well-prepared for any FAANG interview challenge involving strings and prefixes.
