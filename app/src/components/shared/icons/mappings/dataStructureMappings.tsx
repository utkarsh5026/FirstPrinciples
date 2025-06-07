import {
  Binary,
  TreePine,
  Triangle,
  Grid3x3,
  GitCommit,
  Users,
  Hash,
  Box,
  Network,
  Merge,
  Calculator,
  TrendingUp,
  Target,
  Zap,
  Split,
  ArrowUpDown,
  Search,
  ChevronDown,
  Layers,
  Route,
  RotateCcw,
  FileText,
  Shuffle,
  Minimize2,
  Maximize2,
  Brain,
  LucideProps,
} from "lucide-react";
import {
  FaProjectDiagram,
  FaSort,
  FaSortAmountDown,
  FaRoute,
} from "react-icons/fa";
import { BsTree, BsDiagram3, BsGrid, BsGraphUp } from "react-icons/bs";
import { GiStack } from "react-icons/gi";
import { AiOutlinePartition, AiOutlineNodeIndex } from "react-icons/ai";
import { IconMapping } from "./types";

export const dataStructureMappings: IconMapping[] = [
  // Trees
  {
    keywords: ["binary tree", "btree", "b-tree"],
    icon: (props: LucideProps) => <Binary {...props} />,
  },
  {
    keywords: ["avl tree", "avl"],
    icon: (props: LucideProps) => <BsTree {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["red black tree", "red-black"],
    icon: (props: LucideProps) => <TreePine {...props} />,
  },
  {
    keywords: ["binary search trees", "tree", "bst"],
    icon: (props: LucideProps) => <BsTree {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["trie", "prefix tree"],
    icon: (props: LucideProps) => <BsDiagram3 {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["heap", "priority queue", "binary heap"],
    icon: (props: LucideProps) => <Triangle {...props} />,
  },

  // Linear Data Structures
  {
    keywords: ["array", "dynamic array", "vector"],
    icon: (props: LucideProps) => <Grid3x3 {...props} />,
  },
  {
    keywords: ["linked list", "doubly linked", "singly linked"],
    icon: (props: LucideProps) => <GitCommit {...props} />,
  },
  {
    keywords: ["stack", "lifo"],
    icon: (props: LucideProps) => <GiStack {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["queue", "fifo", "circular queue", "deque"],
    icon: (props: LucideProps) => <Users {...props} />,
  },

  {
    keywords: ["hash table", "hash map", "dictionary"],
    icon: (props: LucideProps) => <Hash {...props} />,
  },
  {
    keywords: ["set", "hash set"],
    icon: (props: LucideProps) => <Box {...props} />,
  },

  {
    keywords: ["graph", "directed graph", "undirected graph"],
    icon: (props: LucideProps) => <Network {...props} />,
  },
  {
    keywords: ["adjacency list", "adjacency matrix"],
    icon: (props: LucideProps) => <FaProjectDiagram {...props} />,
    isReactIcon: true,
  },

  {
    keywords: ["matrix", "2d array", "grid"],
    icon: (props: LucideProps) => <BsGrid {...props} />,
    isReactIcon: true,
  },

  // Advanced Structures
  {
    keywords: ["segment tree", "fenwick tree", "bit"],
    icon: (props: LucideProps) => <AiOutlinePartition {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["union find", "disjoint set"],
    icon: (props: LucideProps) => <Merge {...props} />,
  },

  {
    keywords: ["dynamic programming", "dp", "memoization"],
    icon: (props: LucideProps) => <Calculator {...props} />,
  },
  {
    keywords: ["knapsack", "longest common subsequence", "lcs"],
    icon: (props: LucideProps) => <TrendingUp {...props} />,
  },

  {
    keywords: ["greedy", "greedy algorithm"],
    icon: (props: LucideProps) => <Target {...props} />,
  },
  {
    keywords: ["activity selection", "huffman coding"],
    icon: (props: LucideProps) => <Zap {...props} />,
  },

  // Divide and Conquer
  {
    keywords: ["divide and conquer", "merge sort", "quick sort"],
    icon: (props: LucideProps) => <Split {...props} />,
  },

  // Sorting Algorithms
  {
    keywords: ["bubble sort", "selection sort", "insertion sort"],
    icon: (props: LucideProps) => <ArrowUpDown {...props} />,
  },
  {
    keywords: ["heap sort", "radix sort", "counting sort"],
    icon: (props: LucideProps) => <FaSort {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["sort", "sorting"],
    icon: (props: LucideProps) => <FaSortAmountDown {...props} />,
    isReactIcon: true,
  },

  // Searching Algorithms
  {
    keywords: ["binary search", "linear search"],
    icon: (props: LucideProps) => <Search {...props} />,
  },
  {
    keywords: ["depth first search", "dfs"],
    icon: (props: LucideProps) => <ChevronDown {...props} />,
  },
  {
    keywords: ["breadth first search", "bfs"],
    icon: (props: LucideProps) => <Layers {...props} />,
  },

  // Graph Algorithms
  {
    keywords: ["dijkstra", "shortest path"],
    icon: (props: LucideProps) => <Route {...props} />,
  },
  {
    keywords: ["bellman ford", "floyd warshall"],
    icon: (props: LucideProps) => <FaRoute {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["minimum spanning tree", "mst", "kruskal", "prim"],
    icon: (props: LucideProps) => <BsGraphUp {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["topological sort", "cycle detection"],
    icon: (props: LucideProps) => <AiOutlineNodeIndex {...props} />,
    isReactIcon: true,
  },

  // Backtracking
  {
    keywords: ["backtracking", "n queens", "sudoku"],
    icon: (props: LucideProps) => <RotateCcw {...props} />,
  },

  // String Algorithms
  {
    keywords: ["string matching", "kmp", "rabin karp"],
    icon: (props: LucideProps) => <FileText {...props} />,
  },
  {
    keywords: ["edit distance", "levenshtein"],
    icon: (props: LucideProps) => <Shuffle {...props} />,
  },

  // Recursion
  {
    keywords: ["recursion", "recursive"],
    icon: (props: LucideProps) => <RotateCcw {...props} />,
  },

  // Mathematical Algorithms
  {
    keywords: ["prime", "gcd", "lcm", "modular arithmetic"],
    icon: (props: LucideProps) => <Calculator {...props} />,
  },
  {
    keywords: ["fibonacci", "factorial"],
    icon: (props: LucideProps) => <TrendingUp {...props} />,
  },

  // Optimization
  {
    keywords: ["optimization", "minimize", "maximize"],
    icon: (props: LucideProps) => <Minimize2 {...props} />,
  },
  {
    keywords: ["two pointer", "sliding window"],
    icon: (props: LucideProps) => <Maximize2 {...props} />,
  },

  // Advanced Algorithms
  {
    keywords: ["machine learning", "ai algorithm"],
    icon: (props: LucideProps) => <Brain {...props} />,
  },
  {
    keywords: ["bit manipulation", "bitwise"],
    icon: (props: LucideProps) => <Binary {...props} />,
  },
];
