# Centroid Decomposition: A Complete Guide from First Principles

## Understanding the Foundation: What is a Tree?

Before diving into centroid decomposition, let's establish our foundation. In computer science, a **tree** is a connected acyclic graph. This means:

> **Key Insight** : Every tree with `n` nodes has exactly `n-1` edges, and there's exactly one path between any two nodes.

```
Simple Tree Example:
     1
   /   \
  2     3
 / \   /
4   5 6
```

## The Core Problem: Why Do We Need Centroid Decomposition?

Many tree problems require us to efficiently answer queries about paths or subtrees. Traditional approaches often lead to O(n²) complexity for multiple queries. Centroid decomposition helps us achieve better time complexity by creating a special tree structure.

> **The Challenge** : How do we process a tree so that we can answer complex queries efficiently?

## First Principles: What is a Centroid?

Let's build this concept step by step:

### Definition of Centroid

A **centroid** of a tree is a node whose removal results in no subtree having more than `n/2` nodes (where `n` is the total number of nodes).

> **Critical Property** : Every tree has at least one centroid, and at most two centroids.

Let's see this with an example:

```
Tree with 7 nodes:
     1
   /   \
  2     3
 / \   / \
4   5 6   7

Node sizes after removing each node:
- Remove 1: subtrees [2,4,5] and [3,6,7] → sizes 3,3 ≤ 7/2=3.5 ✓
- Remove 2: subtrees [1,3,6,7] and [4], [5] → sizes 4,1,1 ✗ (4 > 3.5)
- Remove 3: subtrees [1,2,4,5] and [6], [7] → sizes 4,1,1 ✗

So node 1 is the centroid!
```

## Finding the Centroid: The Algorithm

Here's how we find a centroid step by step:

```cpp
class CentroidFinder {
private:
    vector<vector<int>> adj;
    vector<bool> removed;
    vector<int> subtree_size;
  
    // Step 1: Calculate subtree sizes
    int calculateSize(int node, int parent) {
        subtree_size[node] = 1;
        for (int child : adj[node]) {
            if (child != parent && !removed[child]) {
                subtree_size[node] += calculateSize(child, node);
            }
        }
        return subtree_size[node];
    }
  
    // Step 2: Find the centroid
    int findCentroid(int node, int parent, int tree_size) {
        for (int child : adj[node]) {
            if (child != parent && !removed[child]) {
                // If any subtree is too large, recurse into it
                if (subtree_size[child] > tree_size / 2) {
                    return findCentroid(child, node, tree_size);
                }
            }
        }
        // If no subtree is too large, this node is the centroid
        return node;
    }
  
public:
    int getCentroid(int root) {
        int tree_size = calculateSize(root, -1);
        return findCentroid(root, -1, tree_size);
    }
};
```

**Code Explanation:**

* `calculateSize()`: Computes the size of each subtree rooted at `node`
* `findCentroid()`: Checks if current node is centroid by ensuring no child subtree exceeds `tree_size/2`
* If a child subtree is too large, we recurse into that subtree
* The `removed` array helps us ignore already processed nodes

## The Decomposition Process

Now comes the magic! Centroid decomposition works by:

1. **Find the centroid** of the current tree
2. **Remove the centroid** (mark as processed)
3. **Recursively decompose** each resulting subtree
4. **Build a new tree** where centroids are connected based on the decomposition hierarchy

```cpp
class CentroidDecomposition {
private:
    vector<vector<int>> adj, decomp_tree;
    vector<bool> removed;
    vector<int> parent_in_decomp;
  
    int decompose(int node) {
        // Find centroid of current component
        int centroid = getCentroid(node);
      
        // Mark centroid as processed
        removed[centroid] = true;
      
        // Recursively decompose each subtree
        for (int child : adj[centroid]) {
            if (!removed[child]) {
                int child_centroid = decompose(child);
              
                // Connect in decomposition tree
                decomp_tree[centroid].push_back(child_centroid);
                parent_in_decomp[child_centroid] = centroid;
            }
        }
      
        return centroid;
    }
  
public:
    int buildDecomposition(int root) {
        return decompose(root);
    }
};
```

**What's happening here:**

* We find the centroid of the current tree component
* Remove it from consideration (set `removed[centroid] = true`)
* For each resulting subtree, recursively find their centroids
* Connect these centroids in our new decomposition tree

## Visualization: Step-by-Step Decomposition

Let's trace through a concrete example:

```
Original Tree:
     1
   /   \
  2     3
 / \   / \
4   5 6   7

Step 1: Find centroid of entire tree
→ Centroid is 1

Step 2: Remove 1, get subtrees [2,4,5] and [3,6,7]

     2       3
    / \     / \
   4   5   6   7

Step 3: Find centroids of each subtree
→ Centroid of [2,4,5] is 2
→ Centroid of [3,6,7] is 3

Step 4: Remove 2 and 3, get leaves [4,5] and [6,7]

Decomposition Tree:
     1
   /   \
  2     3
 / \   / \
4   5 6   7
```

> **Key Insight** : The decomposition tree has height O(log n) because each level reduces the problem size by at least half!

## The Power: Why This Works

The magic of centroid decomposition lies in its  **logarithmic depth** :

> **Fundamental Property** : Any path in the original tree passes through O(log n) centroids in the decomposition tree.

This means we can:

* Process queries in O(log n) time
* Precompute information for each centroid
* Answer complex path queries efficiently

## Common Problem Pattern: Path Queries

Here's a typical FAANG interview problem:

 **Problem** : Count paths of length exactly K in a tree.

```cpp
class PathCounter {
private:
    vector<vector<int>> adj;
    vector<bool> removed;
    vector<int> dist;
    map<int, int> count_at_dist;
    long long result;
  
    // Calculate distances from centroid
    void dfs_distance(int node, int parent, int depth) {
        dist[node] = depth;
        for (int child : adj[node]) {
            if (child != parent && !removed[child]) {
                dfs_distance(child, node, depth + 1);
            }
        }
    }
  
    // Count paths through centroid
    long long countPaths(int centroid, int k) {
        count_at_dist.clear();
        count_at_dist[0] = 1; // centroid itself
        long long ans = 0;
      
        for (int child : adj[centroid]) {
            if (!removed[child]) {
                // Get distances in this subtree
                vector<int> distances;
                dfs_distance(child, centroid, 1);
              
                // Collect distances in this subtree
                function<void(int, int)> collect = [&](int node, int parent) {
                    distances.push_back(dist[node]);
                    for (int next : adj[node]) {
                        if (next != parent && !removed[next]) {
                            collect(next, node);
                        }
                    }
                };
                collect(child, centroid);
              
                // Count paths using previous subtrees
                for (int d : distances) {
                    if (count_at_dist.count(k - d)) {
                        ans += count_at_dist[k - d];
                    }
                }
              
                // Add current subtree distances
                for (int d : distances) {
                    count_at_dist[d]++;
                }
            }
        }
      
        return ans;
    }
  
    void decompose(int node) {
        int centroid = getCentroid(node);
        removed[centroid] = true;
      
        // Count paths passing through this centroid
        result += countPaths(centroid, k);
      
        // Recursively decompose subtrees
        for (int child : adj[centroid]) {
            if (!removed[child]) {
                decompose(child);
            }
        }
    }
};
```

**Algorithm Explanation:**

1. **For each centroid** : Count paths of length K passing through it
2. **Use complementary counting** : For each subtree, count how many nodes are at distance `d`, then find nodes at distance `k-d` in other subtrees
3. **Process subtrees incrementally** : This prevents double counting

## FAANG Interview Context

### When to Use Centroid Decomposition

> **Interview Signal** : Look for these keywords in tree problems:
>
> * "Count paths with property X"
> * "Distance queries on trees"
> * "Update/query operations on tree paths"
> * "Find all pairs with distance K"

### Complexity Analysis

```
Time Complexity:
- Building decomposition: O(n log n)
- Processing each level: O(n)
- Total levels: O(log n)
- Overall: O(n log n)

Space Complexity: O(n)
```

### Common Variations

1. **Path sum queries** : Count paths with sum exactly K
2. **Color counting** : Count paths with exactly K different colored nodes
3. **Dynamic updates** : Handle edge weight updates efficiently

## Advanced Pattern: Distance Queries

Here's another common interview pattern:

```cpp
class DistanceQueries {
private:
    vector<vector<pair<int, int>>> adj; // {node, weight}
    vector<vector<int>> ancestors;
    vector<vector<int>> distances_to_ancestor;
  
    void processDistances(int centroid) {
        // For each node, store distance to this centroid
        function<void(int, int, int)> dfs = [&](int node, int parent, int dist) {
            distances_to_ancestor[node].push_back(dist);
            ancestors[node].push_back(centroid);
          
            for (auto [child, weight] : adj[node]) {
                if (child != parent && !removed[child]) {
                    dfs(child, node, dist + weight);
                }
            }
        };
      
        dfs(centroid, -1, 0);
    }
  
public:
    int queryDistance(int u, int v) {
        int min_dist = INT_MAX;
      
        // Check distance through each common ancestor
        for (int i = 0; i < ancestors[u].size(); i++) {
            if (i < ancestors[v].size() && 
                ancestors[u][i] == ancestors[v][i]) {
                int dist = distances_to_ancestor[u][i] + 
                          distances_to_ancestor[v][i];
                min_dist = min(min_dist, dist);
            }
        }
      
        return min_dist;
    }
};
```

 **Key Innovation** : Each node stores its distance to all its ancestors in the decomposition tree, allowing O(log n) distance queries.

## Interview Tips

> **Pro Tip** : In FAANG interviews, start by explaining the centroid property and why it gives logarithmic depth. This shows deep understanding of the underlying mathematics.

### Common Mistakes to Avoid

1. **Forgetting to mark centroids as removed** : This leads to infinite recursion
2. **Not handling the base case** : Single nodes are their own centroids
3. **Double counting paths** : Always process subtrees incrementally in path counting problems

### Template Structure

```cpp
class CentroidDecomposition {
    // 1. Centroid finding utilities
    // 2. Main decomposition function
    // 3. Problem-specific processing at each centroid
    // 4. Query handling methods
};
```

Centroid decomposition transforms complex tree problems into manageable subproblems by leveraging the fundamental property that trees can be recursively divided at their balance points. This technique appears frequently in advanced FAANG interviews because it demonstrates understanding of both graph theory and divide-and-conquer algorithms.

The key insight is recognizing when a problem benefits from this logarithmic tree structure, then implementing the decomposition correctly while handling the specific requirements of each problem variant.
