import React from "react";
import {
  Code2,
  FileCode,
  Palette,
  BookOpen,
  Container,
  Lock,
  Database,
  Server,
  ClipboardCheck,
  RefreshCw,
  GitBranch,
  GitMerge,
  GitCommit,
  Calendar,
  Workflow,
  AppWindow,
  Pipette,
  Sparkles,
  CircuitBoard,
  Component,
  Wrench,
  Gauge,
  Repeat,
  TimerReset,
  Filter,
  Globe,
  Cloud,
  LucideProps,
  Hammer,
  Rocket,
  Antenna,
  Clock,
  FileStack,
  MessageCircle,
  Lightbulb,
  Activity,
  FolderKanban,
  Brackets,
  Puzzle,
  PuzzleIcon,
  Shield,
  LayoutGrid,
  Crosshair,
  LayoutDashboard,
  BellRing,
  CloudAlert,
  TreePine,
  Binary,
  Network,
  Layers,
  Users,
  Hash,
  Triangle,
  FileText,
  Shuffle,
  ArrowUpDown,
  Search,
  Target,
  Route,
  Zap,
  Brain,
  Calculator,
  TrendingUp,
  Minimize2,
  Maximize2,
  RotateCcw,
  Split,
  Merge,
  ChevronDown,
  Box,
  Grid3x3,
} from "lucide-react";

import {
  FaNodeJs,
  FaNetworkWired,
  FaRegObjectGroup,
  FaLayerGroup,
  FaInfinity,
  FaStream,
  FaRegSave,
  FaSort,
  FaSortAmountDown,
  FaProjectDiagram,
  FaRoute,
} from "react-icons/fa";

import {
  SiRedis,
  SiTailwindcss,
  SiTypescript,
  SiJavascript,
  SiExpress,
  SiMongodb,
  SiGraphql,
  SiPassport,
  SiSequelize,
  SiInstructure,
  SiSocketdotio,
  SiTypeorm,
  SiAxios,
  SiAmazons3,
  SiAmazondynamodb,
  SiAmazonec2,
  SiAmazoncloudwatch,
  SiAmazonrds,
  SiAwslambda,
  SiAmazonsqs,
  SiAmazonroute53,
  SiAmazoneks,
  SiAmazonapigateway,
} from "react-icons/si";
import { PiFunctionFill } from "react-icons/pi";

import { GrTest, GrUserWorker } from "react-icons/gr";
import { IoIosGitNetwork, IoIosRefresh } from "react-icons/io";
import {
  BsCompass,
  BsWindow,
  BsTree,
  BsGrid,
  BsGraphUp,
  BsDiagram3,
} from "react-icons/bs";

import {
  MdApi,
  MdArchitecture,
  MdRocket,
  MdSync,
  MdWebhook,
  MdMemory,
  MdHttp,
  MdLocalLibrary,
  MdAltRoute,
  MdAnimation,
} from "react-icons/md";

import {
  TbBrandDocker,
  TbEngine,
  TbBrandPython,
  TbApi,
  TbGitFork,
  TbBrandGolang,
  TbBrandCss3,
} from "react-icons/tb";

import { RiGitRepositoryLine } from "react-icons/ri";
import { HiOutlineTerminal } from "react-icons/hi";

import {
  BiNetworkChart,
  BiBrain,
  BiData,
  BiCodeCurly,
  BiGitRepoForked,
} from "react-icons/bi";
import { GiStack } from "react-icons/gi";

import { ImConnection } from "react-icons/im";
import getIconForTech from "./iconMap";

import { AiOutlinePartition, AiOutlineNodeIndex } from "react-icons/ai";

type IconMapping = {
  keywords: string[];
  icon: (props: LucideProps) => React.ReactElement;
  isReactIcon?: boolean;
};

const getIconProps = (size: number): LucideProps => ({
  size,
  className: "flex-shrink-0",
});

const getReactIconStyle = (size: number) => ({
  fontSize: size,
  color: "currentColor",
});

const reactMappings: IconMapping[] = [
  {
    keywords: ["hook"],
    icon: (props) => <MdWebhook {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["axios"],
    icon: (props) => <SiAxios {...props} />,
    isReactIcon: true,
  },
  { keywords: ["component"], icon: (props) => <Component {...props} /> },
  {
    keywords: ["fiber"],
    icon: (props) => <FaLayerGroup {...props} />,
    isReactIcon: true,
  },
  { keywords: ["reconciliation"], icon: (props) => <RefreshCw {...props} /> },
  { keywords: ["render"], icon: (props) => <Repeat {...props} /> },
  { keywords: ["state"], icon: (props) => <FolderKanban {...props} /> },
  {
    keywords: ["route", "routing"],
    icon: (props) => <MdAltRoute {...props} />,
  },
];

const cssMappings: IconMapping[] = [
  { keywords: ["layout"], icon: (props) => <LayoutGrid {...props} /> },
  {
    keywords: ["animation", "animate"],
    icon: (props) => <MdAnimation {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["architecture"],
    icon: (props) => <MdArchitecture {...props} />,
    isReactIcon: true,
  },
  { keywords: ["performance"], icon: (props) => <Gauge {...props} /> },
  { keywords: ["visual"], icon: (props) => <Palette {...props} /> },
  { keywords: ["advanced"], icon: (props) => <Pipette {...props} /> },
  {
    keywords: ["css", "style", "styling"],
    icon: (props) => <TbBrandCss3 {...props} />,
    isReactIcon: true,
  },
];

const javascriptMappings: IconMapping[] = [
  { keywords: ["dom"], icon: (props) => <AppWindow {...props} /> },
  { keywords: ["event"], icon: (props) => <BellRing {...props} /> },
  { keywords: ["loop"], icon: (props) => <TimerReset {...props} /> },
  {
    keywords: ["object"],
    icon: (props) => <FaRegObjectGroup {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["function"],
    icon: (props) => <PiFunctionFill {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["scope"],
    icon: (props) => <BsWindow {...props} />,
    isReactIcon: true,
  },
  { keywords: ["browser"], icon: (props) => <Globe {...props} /> },
  { keywords: ["async"], icon: (props) => <Clock {...props} /> },
  {
    keywords: ["engine"],
    icon: (props) => <TbEngine {...props} />,
    isReactIcon: true,
  },
  { keywords: ["this"], icon: (props) => <Crosshair {...props} /> },

  {
    keywords: ["javascript", "js"],
    icon: (props) => <SiJavascript {...props} />,
    isReactIcon: true,
  },
];

const typescriptMappings: IconMapping[] = [
  {
    keywords: ["advanced type"],
    icon: (props) => <BiCodeCurly {...props} />,
    isReactIcon: true,
  },
  { keywords: ["generic"], icon: (props) => <Brackets {...props} /> },
  {
    keywords: ["object"],
    icon: (props) => <FaRegObjectGroup {...props} />,
    isReactIcon: true,
  },
  { keywords: ["system"], icon: (props) => <CircuitBoard {...props} /> },
  // Default TypeScript icon
  {
    keywords: ["typescript", "ts ", "type", "interface"],
    icon: (props) => <SiTypescript {...props} />,
    isReactIcon: true,
  },
];

const nodejsMappings: IconMapping[] = [
  {
    keywords: ["graph"],
    icon: (props) => <SiGraphql {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["sequelize"],
    icon: (props) => <SiSequelize {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["typeorm"],
    icon: (props) => <SiTypeorm {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["express"],
    icon: (props) => <SiExpress {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["stream", "event"],
    icon: (props) => <FaStream {...props} />,
    isReactIcon: true,
  },
  { keywords: ["module"], icon: (props) => <Puzzle {...props} /> },
  {
    keywords: ["http"],
    icon: (props) => <MdHttp {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["api"],
    icon: (props) => <TbApi {...props} />,
    isReactIcon: true,
  },
  { keywords: ["auth"], icon: (props) => <Lock {...props} /> },
  {
    keywords: ["passport"],
    icon: (props) => <SiPassport {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["worker"],
    icon: (props) => <GrUserWorker {...props} />,
    isReactIcon: true,
  },
  { keywords: ["middleware"], icon: (props) => <Workflow {...props} /> },
  {
    keywords: ["websocket", "socket"],
    icon: (props) => <SiSocketdotio {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["message", "queue"],
    icon: (props) => <MessageCircle {...props} />,
  },
  { keywords: ["crypto"], icon: (props) => <Shield {...props} /> },
  { keywords: ["serverless"], icon: (props) => <Cloud {...props} /> },
  {
    keywords: ["mongoose"],
    icon: (props) => <SiMongodb {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["test"],
    icon: (props) => <GrTest {...props} />,
    isReactIcon: true,
  },

  {
    keywords: ["deploy"],
    icon: (props) => <MdRocket {...props} />,
    isReactIcon: true,
  },
  { keywords: ["real time"], icon: (props) => <Activity {...props} /> },
  {
    keywords: ["server", "npm"],
    icon: (props) => <FaNodeJs {...props} />,
    isReactIcon: true,
  },
];

const goMappings: IconMapping[] = [
  {
    keywords: ["channel"],
    icon: (props) => <ImConnection {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["concurrency"],
    icon: (props) => <FaInfinity {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["context"],
    icon: (props) => <BsCompass {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["goroutine"],
    icon: (props) => <FaNetworkWired {...props} />,
    isReactIcon: true,
  },
  { keywords: ["scheduler"], icon: (props) => <Calendar {...props} /> },
  {
    keywords: ["memory"],
    icon: (props) => <MdMemory {...props} />,
    isReactIcon: true,
  },
  { keywords: ["standard library"], icon: (props) => <FileStack {...props} /> },
  {
    keywords: ["sync"],
    icon: (props) => <MdSync {...props} />,
    isReactIcon: true,
  },
  { keywords: ["select"], icon: (props) => <Filter {...props} /> },
  {
    keywords: ["go ", "golang"],
    icon: (props) => <TbBrandGolang {...props} />,
    isReactIcon: true,
  },
];

const pythonMappings: IconMapping[] = [
  {
    keywords: ["object"],
    icon: (props) => <FaRegObjectGroup {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["concurrent"],
    icon: (props) => <IoIosGitNetwork {...props} />,
    isReactIcon: true,
  },
  { keywords: ["standard library"], icon: (props) => <FileStack {...props} /> },
  {
    keywords: ["data structure"],
    icon: (props) => <FaLayerGroup {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["algorithm"],
    icon: (props) => <BiBrain {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["python", "django", "flask"],
    icon: (props) => <TbBrandPython {...props} />,
    isReactIcon: true,
  },
];

const dockerMappings: IconMapping[] = [
  { keywords: ["container"], icon: (props) => <Container {...props} /> },
  { keywords: ["image"], icon: (props) => <AppWindow {...props} /> },
  {
    keywords: ["docker"],
    icon: (props) => <TbBrandDocker {...props} />,
    isReactIcon: true,
  },
];

const awsMappings: IconMapping[] = [
  {
    keywords: ["s3", "storage", "bucket"],
    icon: (props) => <SiAmazons3 {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["dynamodb", "dynamo", "nosql"],
    icon: (props) => <SiAmazondynamodb {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["ec2", "compute", "instance"],
    icon: (props) => <SiAmazonec2 {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["cloudwatch", "monitoring", "logs"],
    icon: (props) => <SiAmazoncloudwatch {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["rds", "database", "relational"],
    icon: (props) => <SiAmazonrds {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["lambda", "serverless", "function"],
    icon: (props) => <SiAwslambda {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["sqs", "queue", "message"],
    icon: (props) => <SiAmazonsqs {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["cloudfront", "cdn", "distribution"],
    icon: (props) => <CloudAlert {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["route53", "dns", "domain"],
    icon: (props) => <SiAmazonroute53 {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["eks", "kubernetes"],
    icon: (props) => <SiAmazoneks {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["ecr", "container", "registry"],
    icon: (props) => <Container {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["ecs", "container", "service"],
    icon: (props) => <Container {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["api gateway", "gateway"],
    icon: (props) => <SiAmazonapigateway {...props} />,
    isReactIcon: true,
  },
];

const gitMappings: IconMapping[] = [
  { keywords: ["branch"], icon: (props) => <GitBranch {...props} /> },
  { keywords: ["merge"], icon: (props) => <GitMerge {...props} /> },
  {
    keywords: ["rebase"],
    icon: (props) => <TbGitFork {...props} />,
    isReactIcon: true,
  },
  { keywords: ["object"], icon: (props) => <FileCode {...props} /> },
  { keywords: ["internal"], icon: (props) => <GitCommit {...props} /> },
  {
    keywords: ["basics"],
    icon: (props) => <RiGitRepositoryLine {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["git", "commit"],
    icon: (props) => <BiGitRepoForked {...props} />,
    isReactIcon: true,
  },
];

const redisMappings: IconMapping[] = [
  { keywords: ["pub sub"], icon: (props) => <Antenna {...props} /> },
  {
    keywords: ["data structure"],
    icon: (props) => <FaLayerGroup {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["cache"],
    icon: (props) => <IoIosRefresh {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["persistance"],
    icon: (props) => <FaRegSave {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["command"],
    icon: (props) => <HiOutlineTerminal {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["architecture"],
    icon: (props) => <MdArchitecture {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["redis"],
    icon: (props) => <SiRedis {...props} />,
    isReactIcon: true,
  },
];

const tailwindMappings: IconMapping[] = [
  { keywords: ["layout"], icon: (props) => <LayoutGrid {...props} /> },
  {
    keywords: ["tailwind", "utility", "css framework"],
    icon: (props) => <SiTailwindcss {...props} />,
    isReactIcon: true,
  },
];

const generalConceptMappings: IconMapping[] = [
  {
    keywords: ["library", "libraries"],
    icon: (props) => <MdLocalLibrary {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["structure", "struct"],
    icon: (props) => <SiInstructure {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["fundamental", "core", "basic", "foundation"],
    icon: (props) => <BookOpen {...props} />,
  },
  {
    keywords: ["advanced", "deep dive", "internals"],
    icon: (props) => <Lightbulb {...props} />,
  },
  {
    keywords: ["architecture", "structure", "design"],
    icon: (props) => <MdArchitecture {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["pattern", "practice"],
    icon: (props) => <PuzzleIcon {...props} />,
  },
  {
    keywords: ["performance", "optimization", "efficient"],
    icon: (props) => <Gauge {...props} />,
  },
  {
    keywords: ["security", "auth", "token", "encryption"],
    icon: (props) => <Shield {...props} />,
  },
  {
    keywords: ["data", "storage", "database"],
    icon: (props) => <Database {...props} />,
  },
  {
    keywords: ["api", "endpoint", "service"],
    icon: (props) => <MdApi {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["async", "concurrent", "parallel", "thread"],
    icon: (props) => <BiNetworkChart {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["test", "quality", "validation"],
    icon: (props) => <ClipboardCheck {...props} />,
  },
  {
    keywords: ["deploy", "release", "continuous", "production"],
    icon: (props) => <Rocket {...props} />,
  },
  {
    keywords: ["layout", "grid", "flex"],
    icon: (props) => <LayoutGrid {...props} />,
  },
  {
    keywords: ["function", "lambda", "callback"],
    icon: (props) => <PiFunctionFill {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["object", "class", "inheritance"],
    icon: (props) => <FaRegObjectGroup {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["algorithm", "data structure", "complexity"],
    icon: (props) => <BiData {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["state", "store", "context"],
    icon: (props) => <Workflow {...props} />,
  },
  {
    keywords: ["render", "display", "ui", "interface"],
    icon: (props) => <AppWindow {...props} />,
  },
  {
    keywords: ["tool", "config", "build"],
    icon: (props) => <Wrench {...props} />,
  },
  {
    keywords: ["network", "protocol", "http", "socket", "communication"],
    icon: (props) => <Globe {...props} />,
  },
  {
    keywords: ["system", "design"],
    icon: (props) => <LayoutDashboard {...props} />,
  },
];

const fallbackMappings: IconMapping[] = [
  { keywords: ["implementation"], icon: (props) => <Hammer {...props} /> },
  { keywords: ["deep dive"], icon: (props) => <Sparkles {...props} /> },
  { keywords: ["web"], icon: (props) => <Globe {...props} /> },
  { keywords: ["server"], icon: (props) => <Server {...props} /> },
  { keywords: ["client"], icon: (props) => <AppWindow {...props} /> },
];

const dataStructureMappings: IconMapping[] = [
  // Trees
  {
    keywords: ["binary tree", "btree", "b-tree"],
    icon: (props) => <Binary {...props} />,
  },
  {
    keywords: ["avl tree", "avl"],
    icon: (props) => <BsTree {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["red black tree", "red-black"],
    icon: (props) => <TreePine {...props} />,
  },
  {
    keywords: ["binary search trees", "tree", "bst"],
    icon: (props) => <BsTree {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["trie", "prefix tree"],
    icon: (props) => <BsDiagram3 {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["heap", "priority queue", "binary heap"],
    icon: (props) => <Triangle {...props} />,
  },

  // Linear Data Structures
  {
    keywords: ["array", "dynamic array", "vector"],
    icon: (props) => <Grid3x3 {...props} />,
  },
  {
    keywords: ["linked list", "doubly linked", "singly linked"],
    icon: (props) => <GitCommit {...props} />,
  },
  {
    keywords: ["stack", "lifo"],
    icon: (props) => <GiStack {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["queue", "fifo", "circular queue", "deque"],
    icon: (props) => <Users {...props} />,
  },

  {
    keywords: ["hash table", "hash map", "dictionary"],
    icon: (props) => <Hash {...props} />,
  },
  {
    keywords: ["set", "hash set"],
    icon: (props) => <Box {...props} />,
  },

  {
    keywords: ["graph", "directed graph", "undirected graph"],
    icon: (props) => <Network {...props} />,
  },
  {
    keywords: ["adjacency list", "adjacency matrix"],
    icon: (props) => <FaProjectDiagram {...props} />,
    isReactIcon: true,
  },

  {
    keywords: ["matrix", "2d array", "grid"],
    icon: (props) => <BsGrid {...props} />,
    isReactIcon: true,
  },

  // Advanced Structures
  {
    keywords: ["segment tree", "fenwick tree", "bit"],
    icon: (props) => <AiOutlinePartition {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["union find", "disjoint set"],
    icon: (props) => <Merge {...props} />,
  },

  {
    keywords: ["dynamic programming", "dp", "memoization"],
    icon: (props) => <Calculator {...props} />,
  },
  {
    keywords: ["knapsack", "longest common subsequence", "lcs"],
    icon: (props) => <TrendingUp {...props} />,
  },

  {
    keywords: ["greedy", "greedy algorithm"],
    icon: (props) => <Target {...props} />,
  },
  {
    keywords: ["activity selection", "huffman coding"],
    icon: (props) => <Zap {...props} />,
  },

  // Divide and Conquer
  {
    keywords: ["divide and conquer", "merge sort", "quick sort"],
    icon: (props) => <Split {...props} />,
  },

  // Sorting Algorithms
  {
    keywords: ["bubble sort", "selection sort", "insertion sort"],
    icon: (props) => <ArrowUpDown {...props} />,
  },
  {
    keywords: ["heap sort", "radix sort", "counting sort"],
    icon: (props) => <FaSort {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["sort", "sorting"],
    icon: (props) => <FaSortAmountDown {...props} />,
    isReactIcon: true,
  },

  // Searching Algorithms
  {
    keywords: ["binary search", "linear search"],
    icon: (props) => <Search {...props} />,
  },
  {
    keywords: ["depth first search", "dfs"],
    icon: (props) => <ChevronDown {...props} />,
  },
  {
    keywords: ["breadth first search", "bfs"],
    icon: (props) => <Layers {...props} />,
  },

  // Graph Algorithms
  {
    keywords: ["dijkstra", "shortest path"],
    icon: (props) => <Route {...props} />,
  },
  {
    keywords: ["bellman ford", "floyd warshall"],
    icon: (props) => <FaRoute {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["minimum spanning tree", "mst", "kruskal", "prim"],
    icon: (props) => <BsGraphUp {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["topological sort", "cycle detection"],
    icon: (props) => <AiOutlineNodeIndex {...props} />,
    isReactIcon: true,
  },

  // Backtracking
  {
    keywords: ["backtracking", "n queens", "sudoku"],
    icon: (props) => <RotateCcw {...props} />,
  },

  // String Algorithms
  {
    keywords: ["string matching", "kmp", "rabin karp"],
    icon: (props) => <FileText {...props} />,
  },
  {
    keywords: ["edit distance", "levenshtein"],
    icon: (props) => <Shuffle {...props} />,
  },

  // Recursion
  {
    keywords: ["recursion", "recursive"],
    icon: (props) => <RotateCcw {...props} />,
  },

  // Mathematical Algorithms
  {
    keywords: ["prime", "gcd", "lcm", "modular arithmetic"],
    icon: (props) => <Calculator {...props} />,
  },
  {
    keywords: ["fibonacci", "factorial"],
    icon: (props) => <TrendingUp {...props} />,
  },

  // Optimization
  {
    keywords: ["optimization", "minimize", "maximize"],
    icon: (props) => <Minimize2 {...props} />,
  },
  {
    keywords: ["two pointer", "sliding window"],
    icon: (props) => <Maximize2 {...props} />,
  },

  // Advanced Algorithms
  {
    keywords: ["machine learning", "ai algorithm"],
    icon: (props) => <Brain {...props} />,
  },
  {
    keywords: ["bit manipulation", "bitwise"],
    icon: (props) => <Binary {...props} />,
  },
];

const allMappings = [
  {
    keywords: ["aws", "amazon"],
    mappings: awsMappings,
  },
  {
    keywords: ["node", "npm"],
    mappings: nodejsMappings,
  },
  {
    keywords: ["react", "jsx"],
    mappings: reactMappings,
  },
  {
    keywords: ["css", "style", "layout", "visual", "styling", "animation"],
    mappings: cssMappings,
  },
  {
    keywords: ["javascript", "dom", "event", "browser"],
    mappings: javascriptMappings,
  },
  {
    keywords: ["typescript", "ts "],
    mappings: typescriptMappings,
  },

  {
    keywords: ["go", "golang", "goroutine"],
    mappings: goMappings,
  },
  { keywords: ["python"], mappings: pythonMappings },
  { keywords: ["docker", "container", "image"], mappings: dockerMappings },
  {
    keywords: ["git", "branch", "merge", "rebase", "commit"],
    mappings: gitMappings,
  },
  { keywords: ["redis", "cache", "pub sub"], mappings: redisMappings },
  {
    keywords: ["tailwind", "utility", "css framework"],
    mappings: tailwindMappings,
  },
  {
    keywords: ["data structures", "algorithms"],
    mappings: dataStructureMappings,
  },
];

const topicCache = new Map<string, React.ReactElement>();

const getTopicIcon = (topic: string, size: number = 16): React.ReactElement => {
  if (topicCache.has(topic)) return topicCache.get(topic) as React.ReactElement;

  const normalizedTopic = topic.toLowerCase().replace(/_/g, " ");
  const parts = normalizedTopic
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 1) {
    const icon = getIconForTech(parts[0]);
    if (icon) return React.createElement(icon, { size });
  }
  const mainCategory = parts[0];
  const specificTopic = parts[parts.length - 1];

  const iconProps = getIconProps(size);
  const reactIconStyle = getReactIconStyle(size);

  const getIconFromMappings = (mappings: IconMapping[]) => {
    for (const { keywords, isReactIcon, icon } of mappings) {
      if (!keywords.some((k) => specificTopic.includes(k))) {
        continue;
      }
      const topicIcon = isReactIcon ? icon(reactIconStyle) : icon(iconProps);
      topicCache.set(topic, topicIcon);
      return topicIcon;
    }
  };

  for (const { keywords: categoryKeywords, mappings } of allMappings) {
    if (!categoryKeywords.some((keyword) => mainCategory.includes(keyword)))
      continue;

    const icon = getIconFromMappings(mappings);
    if (icon) return icon;
  }

  const generalConceptIcon = getIconFromMappings(generalConceptMappings);
  if (generalConceptIcon) return generalConceptIcon;

  const fallbackIcon = getIconFromMappings(fallbackMappings);
  if (fallbackIcon) return fallbackIcon;

  return <Code2 {...iconProps} />;
};

export default getTopicIcon;
