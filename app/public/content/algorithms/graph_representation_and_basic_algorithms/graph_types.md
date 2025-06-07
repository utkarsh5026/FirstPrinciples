# Graph Types in Data Structures & Algorithms: A Complete Guide for FAANG Interviews

## What is a Graph? Building from First Principles

> **Fundamental Definition** : A graph is a mathematical structure that models relationships between objects. Think of it as a network where entities (called vertices or nodes) are connected by relationships (called edges).

Let's start with the most basic understanding. Imagine you're looking at a social media platform:

* **People** = Vertices/Nodes
* **Friendships** = Edges

This simple analogy will help us understand all graph types as we build complexity layer by layer.

```python
# Most basic graph representation - just the concept
# Node A connected to Node B
class BasicGraph:
    def __init__(self):
        # Dictionary where key = node, value = list of connected nodes
        self.connections = {}
  
    def add_connection(self, node1, node2):
        # This is the fundamental operation - connecting two nodes
        if node1 not in self.connections:
            self.connections[node1] = []
        self.connections[node1].append(node2)

# Example: Creating a simple friendship network
graph = BasicGraph()
graph.add_connection("Alice", "Bob")  # Alice knows Bob
```

 **Why this code matters** : This shows the absolute core concept - we're storing which nodes connect to which other nodes. Everything else builds on this foundation.

## Type 1: Undirected Graphs

> **Core Principle** : In an undirected graph, relationships are mutual. If A connects to B, then B automatically connects to A.

Think of this like **handshakes** - when you shake hands with someone, they're also shaking hands with you. The relationship is bidirectional by nature.

### Visual Representation (Mobile-Optimized):

```
    A
    |
    |
    B ---- C
    |    /
    |   /
    D--E
```

### Implementation Deep Dive:

```python
class UndirectedGraph:
    def __init__(self):
        self.adjacency_list = {}
  
    def add_vertex(self, vertex):
        """Add a single node to the graph"""
        if vertex not in self.adjacency_list:
            self.adjacency_list[vertex] = []
  
    def add_edge(self, vertex1, vertex2):
        """Connect two vertices with an undirected edge"""
        # First, ensure both vertices exist
        self.add_vertex(vertex1)
        self.add_vertex(vertex2)
      
        # Add each vertex to the other's adjacency list
        # This is the KEY difference - we add BOTH directions
        self.adjacency_list[vertex1].append(vertex2)
        self.adjacency_list[vertex2].append(vertex1)
  
    def display(self):
        """Show all connections"""
        for vertex, neighbors in self.adjacency_list.items():
            print(f"{vertex}: {neighbors}")

# Building a social network example
social_network = UndirectedGraph()
social_network.add_edge("Alice", "Bob")
social_network.add_edge("Bob", "Charlie")
social_network.add_edge("Charlie", "Alice")
social_network.display()

# Output:
# Alice: ['Bob', 'Charlie']
# Bob: ['Alice', 'Charlie'] 
# Charlie: ['Bob', 'Alice']
```

 **Code Explanation** :

* `add_edge()` is the critical method - notice how we add vertex2 to vertex1's list AND vertex1 to vertex2's list
* This ensures the "mutual relationship" property
* When we add Alice-Bob friendship, both Alice and Bob have each other in their friend lists

### FAANG Interview Applications:

> **Key Insight** : Undirected graphs appear in problems involving mutual relationships, symmetric connections, or situations where "if A relates to B, then B relates to A."

 **Common Problem Patterns** :

1. **Connected Components** - Finding groups of friends
2. **Shortest Path** - Degrees of separation in social networks
3. **Cycle Detection** - Detecting circular dependencies

## Type 2: Directed Graphs (Digraphs)

> **Core Principle** : In directed graphs, relationships have direction. A→B doesn't mean B→A. Think of one-way streets or Twitter follows.

The fundamental difference is  **asymmetry** . Just because you follow someone on Twitter doesn't mean they follow you back.

### Visual Representation:

```
    A
    ↓
    B → C
    ↓ ↗
    D → E
```

### Implementation Deep Dive:

```python
class DirectedGraph:
    def __init__(self):
        self.adjacency_list = {}
  
    def add_vertex(self, vertex):
        if vertex not in self.adjacency_list:
            self.adjacency_list[vertex] = []
  
    def add_edge(self, from_vertex, to_vertex):
        """Add a directed edge FROM one vertex TO another"""
        self.add_vertex(from_vertex)
        self.add_vertex(to_vertex)
      
        # CRITICAL: Only add one direction
        # from_vertex can reach to_vertex, but NOT vice versa
        self.adjacency_list[from_vertex].append(to_vertex)
        # Notice: We DON'T add from_vertex to to_vertex's list
  
    def display(self):
        for vertex, neighbors in self.adjacency_list.items():
            print(f"{vertex} → {neighbors}")

# Building a Twitter-like follow system
twitter = DirectedGraph()
twitter.add_edge("Alice", "Bob")    # Alice follows Bob
twitter.add_edge("Bob", "Charlie")  # Bob follows Charlie
twitter.add_edge("Charlie", "Alice") # Charlie follows Alice
twitter.display()

# Output:
# Alice → ['Bob']
# Bob → ['Charlie']
# Charlie → ['Alice']
```

 **Code Explanation** :

* The crucial difference is in `add_edge()` - we only add the relationship in ONE direction
* `from_vertex` gets `to_vertex` added to its list, but not the reverse
* This models real-world scenarios like web links, dependencies, or hierarchies

### FAANG Interview Applications:

> **Key Insight** : Directed graphs model cause-and-effect, dependency, or hierarchical relationships.

 **Common Problem Patterns** :

1. **Topological Sorting** - Course prerequisites, task scheduling
2. **Strongly Connected Components** - Web page clusters
3. **Cycle Detection** - Deadlock detection in systems

## Type 3: Weighted Graphs

> **Core Principle** : Edges have values (weights) representing cost, distance, time, or any quantifiable relationship between nodes.

Think of this as adding **"how much"** to the  **"who connects to whom"** . It's like a road map where edges represent roads and weights represent distances.

### Conceptual Example:

Instead of just knowing "City A connects to City B," we know "City A connects to City B with a distance of 150 miles."

### Implementation Deep Dive:

```python
class WeightedGraph:
    def __init__(self, directed=False):
        self.adjacency_list = {}
        self.directed = directed
  
    def add_vertex(self, vertex):
        if vertex not in self.adjacency_list:
            self.adjacency_list[vertex] = []
  
    def add_edge(self, vertex1, vertex2, weight):
        """Add an edge with a specific weight/cost"""
        self.add_vertex(vertex1)
        self.add_vertex(vertex2)
      
        # Store as tuple: (destination, weight)
        self.adjacency_list[vertex1].append((vertex2, weight))
      
        # If undirected, add reverse edge too
        if not self.directed:
            self.adjacency_list[vertex2].append((vertex1, weight))
  
    def display(self):
        for vertex, edges in self.adjacency_list.items():
            connections = []
            for neighbor, weight in edges:
                connections.append(f"{neighbor}(w:{weight})")
            print(f"{vertex} → {connections}")

# Building a flight network with costs
flight_network = WeightedGraph(directed=True)
flight_network.add_edge("NYC", "London", 800)    # $800 flight
flight_network.add_edge("NYC", "Tokyo", 1200)    # $1200 flight
flight_network.add_edge("London", "Paris", 150)  # $150 flight
flight_network.display()

# Output:
# NYC → ['London(w:800)', 'Tokyo(w:1200)']
# London → ['Paris(w:150)']
# Tokyo → []
```

 **Code Explanation** :

* We store edges as tuples `(destination, weight)` instead of just the destination
* The weight can represent anything: distance, cost, time, bandwidth, etc.
* This allows algorithms to make decisions based on the "cost" of traversing edges

### Advanced Weight Representation:

```python
class AdvancedWeightedGraph:
    def __init__(self):
        # Alternative representation using nested dictionaries
        self.graph = {}
  
    def add_edge(self, vertex1, vertex2, weight):
        # Create nested structure: graph[from][to] = weight
        if vertex1 not in self.graph:
            self.graph[vertex1] = {}
        if vertex2 not in self.graph:
            self.graph[vertex2] = {}
          
        self.graph[vertex1][vertex2] = weight
  
    def get_weight(self, vertex1, vertex2):
        """Get weight of edge between two vertices"""
        return self.graph.get(vertex1, {}).get(vertex2, float('inf'))

# Usage for pathfinding algorithms
road_map = AdvancedWeightedGraph()
road_map.add_edge("Home", "Work", 15)    # 15 minutes drive
road_map.add_edge("Home", "Store", 8)    # 8 minutes drive
road_map.add_edge("Store", "Work", 12)   # 12 minutes drive

print(road_map.get_weight("Home", "Work"))  # Output: 15
```

### FAANG Interview Applications:

> **Critical Insight** : Weighted graphs are essential for optimization problems - finding shortest paths, minimum costs, or maximum flows.

 **Common Problem Patterns** :

1. **Shortest Path Algorithms** - Dijkstra's, Bellman-Ford
2. **Minimum Spanning Tree** - Network design, connecting cities with minimum cost
3. **Network Flow** - Maximum data flow through network

## Type 4: Unweighted Graphs

> **Core Principle** : All edges have equal "cost" or importance. The relationship exists or doesn't exist - there's no measurement of strength.

This is the default assumption when weights aren't specified. Think of simple yes/no relationships: "Are two people friends?" or "Are two web pages linked?"

### Implementation:

```python
class UnweightedGraph:
    def __init__(self, directed=False):
        self.adjacency_list = {}
        self.directed = directed
  
    def add_edge(self, vertex1, vertex2):
        """Add an unweighted edge (implicit weight = 1)"""
        if vertex1 not in self.adjacency_list:
            self.adjacency_list[vertex1] = []
        if vertex2 not in self.adjacency_list:
            self.adjacency_list[vertex2] = []
          
        self.adjacency_list[vertex1].append(vertex2)
      
        if not self.directed:
            self.adjacency_list[vertex2].append(vertex1)
  
    def bfs_shortest_path(self, start, target):
        """Find shortest path in unweighted graph using BFS"""
        from collections import deque
      
        queue = deque([(start, [start])])  # (current_node, path_to_node)
        visited = set([start])
      
        while queue:
            current, path = queue.popleft()
          
            if current == target:
                return path
          
            for neighbor in self.adjacency_list.get(current, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, path + [neighbor]))
      
        return None  # No path found

# Internet web page linking example
web_graph = UnweightedGraph(directed=True)
web_graph.add_edge("HomePage", "AboutPage")
web_graph.add_edge("HomePage", "ProductsPage")
web_graph.add_edge("ProductsPage", "ContactPage")

path = web_graph.bfs_shortest_path("HomePage", "ContactPage")
print(f"Navigation path: {' → '.join(path)}")
# Output: Navigation path: HomePage → ProductsPage → ContactPage
```

 **Code Explanation** :

* No weights means we can use simple BFS for shortest path (each edge counts as 1 step)
* This is much simpler than weighted shortest path algorithms
* Perfect for problems where you just need to know "how many steps" rather than "what's the total cost"

### FAANG Interview Applications:

> **Key Insight** : Unweighted graphs are perfect for problems where you need the shortest path in terms of number of edges, not total cost.

 **Common Problem Patterns** :

1. **Level-order traversals** - BFS problems
2. **Shortest path in steps** - Word ladder, minimum jumps
3. **Connectivity problems** - Can you reach from A to B?

## Combining Graph Types: Real Interview Scenarios

> **Advanced Understanding** : Most real-world problems combine these concepts. You might have a directed, weighted graph or an undirected, unweighted graph.

### Example: Social Network Analysis (Undirected + Weighted)

```python
class SocialNetworkGraph:
    def __init__(self):
        self.friendships = {}  # Undirected, weighted by interaction strength
  
    def add_friendship(self, person1, person2, interaction_strength):
        """Model friendship with interaction strength as weight"""
        if person1 not in self.friendships:
            self.friendships[person1] = []
        if person2 not in self.friendships:
            self.friendships[person2] = []
          
        # Undirected: both people have each other as friends
        # Weighted: interaction strength shows how close they are
        self.friendships[person1].append((person2, interaction_strength))
        self.friendships[person2].append((person1, interaction_strength))
  
    def find_closest_friends(self, person):
        """Find friends with highest interaction strength"""
        if person in self.friendships:
            # Sort by weight (interaction strength) in descending order
            friends = sorted(self.friendships[person], 
                           key=lambda x: x[1], reverse=True)
            return friends[:3]  # Top 3 closest friends
        return []

# Usage
network = SocialNetworkGraph()
network.add_friendship("Alice", "Bob", 8.5)      # Very close friends
network.add_friendship("Alice", "Charlie", 6.2)  # Good friends
network.add_friendship("Alice", "David", 9.1)    # Best friends

closest = network.find_closest_friends("Alice")
print("Alice's closest friends:")
for friend, strength in closest:
    print(f"  {friend}: {strength}/10 closeness")
```

## Interview Strategy: Identifying Graph Types

> **Pro Tip** : In FAANG interviews, quickly identifying the graph type determines which algorithms you should consider.

### Decision Framework:

1. **Read the problem carefully** - Look for relationship keywords
2. **Ask clarifying questions** :

* "Are relationships mutual?" (Undirected vs Directed)
* "Do connections have different costs/weights?" (Weighted vs Unweighted)

1. **Choose data structure** based on graph type
2. **Select appropriate algorithm** based on graph properties

### Common Interview Question Patterns:

```
Undirected + Unweighted → BFS for shortest path
Directed + Unweighted → Topological sort, DFS
Directed + Weighted → Dijkstra's algorithm
Undirected + Weighted → Minimum spanning tree (Kruskal's/Prim's)
```

 **Final Thought** : Understanding these four fundamental graph types gives you the foundation to tackle any graph problem in FAANG interviews. The key is recognizing which type you're dealing with, then applying the appropriate algorithms and data structures.
