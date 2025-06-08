import {
  Binary,
  Triangle,
  Grid3x3,
  GitCommit,
  Users,
  Hash,
  Network,
  Calculator,
  Target,
  Split,
  Search,
  Route,
  RotateCcw,
  Minimize2,
  Maximize2,
  Move,
  LucideProps,
} from "lucide-react";
import { FaSortAmountDown } from "react-icons/fa";
import { BsTree, BsGrid } from "react-icons/bs";
import { GiStack } from "react-icons/gi";
import { TbNavigationSearch } from "react-icons/tb";
import { IconMapping } from "./types";

export const dataStructureMappings: IconMapping[] = [
  {
    keywords: ["traversal"],
    icon: (props: LucideProps) => <Route {...props} />,
  },
  {
    keywords: ["binary tree", "btree", "b-tree"],
    icon: (props: LucideProps) => <Binary {...props} />,
  },
  {
    keywords: ["binary search trees"],
    icon: (props: LucideProps) => <TbNavigationSearch {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["tree"],
    icon: (props: LucideProps) => <BsTree {...props} />,
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
    keywords: ["queue"],
    icon: (props: LucideProps) => <Users {...props} />,
  },

  {
    keywords: ["hash table", "hash map", "dictionary"],
    icon: (props: LucideProps) => <Hash {...props} />,
  },

  {
    keywords: ["graph", "directed graph", "undirected graph"],
    icon: (props: LucideProps) => <Network {...props} />,
  },

  {
    keywords: ["matrix", "2d array", "grid"],
    icon: (props: LucideProps) => <BsGrid {...props} />,
    isReactIcon: true,
  },

  {
    keywords: ["dynamic programming", "dp", "memoization"],
    icon: (props: LucideProps) => <Calculator {...props} />,
  },

  {
    keywords: ["greedy", "greedy algorithm"],
    icon: (props: LucideProps) => <Target {...props} />,
  },

  // Divide and Conquer
  {
    keywords: ["divide and conquer", "merge sort", "quick sort"],
    icon: (props: LucideProps) => <Split {...props} />,
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

  // Backtracking
  {
    keywords: ["backtracking", "n queens", "sudoku"],
    icon: (props: LucideProps) => <RotateCcw {...props} />,
  },

  // Recursion
  {
    keywords: ["recursion", "recursive"],
    icon: (props: LucideProps) => <RotateCcw {...props} />,
  },

  {
    keywords: ["optimization", "minimize", "maximize"],
    icon: (props: LucideProps) => <Minimize2 {...props} />,
  },
  {
    keywords: ["two pointer"],
    icon: (props: LucideProps) => <Maximize2 {...props} />,
  },

  {
    keywords: ["sliding window"],
    icon: (props: LucideProps) => <Move {...props} />,
  },

  {
    keywords: ["bit manipulation", "bitwise"],
    icon: (props: LucideProps) => <Binary {...props} />,
  },
];
