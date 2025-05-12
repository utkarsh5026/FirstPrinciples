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
  Router,
  Network,
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
} from "lucide-react";

// Import React Icons we need
import {
  FaReact,
  FaNodeJs,
  FaNetworkWired,
  FaRegObjectGroup,
  FaLayerGroup,
  FaInfinity,
  FaStream,
  FaRegSave,
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
} from "react-icons/si";
import { PiFunctionFill } from "react-icons/pi";

import { GrTest, GrUserWorker } from "react-icons/gr";
import { IoIosGitNetwork, IoIosRefresh } from "react-icons/io";
import { BsCompass, BsWindow } from "react-icons/bs";

import {
  MdApi,
  MdArchitecture,
  MdRocket,
  MdSync,
  MdWebhook,
  MdMemory,
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

import { ImConnection } from "react-icons/im";

/**
 * This is a comprehensive topic icon mapping function that analyzes a topic name
 * and returns the most appropriate icon based on keywords and context.
 *
 * The function works by:
 * 1. First identifying category-specific keywords
 * 2. Then identifying general concept keywords
 * 3. Using fallback icons when no specific match is found
 *
 * @param topic The topic or subdirectory name
 * @param size Icon size (defaults to 16px)
 * @returns A React component for the icon
 */
const getTopicIcon = (topic: string, size: number = 16): React.ReactElement => {
  const normalizedTopic = topic.toLowerCase().replace(/_/g, " ");
  console.log(normalizedTopic);

  const iconProps: LucideProps = {
    size,
    className: "text-primary flex-shrink-0",
  };
  const reactIconStyle = { fontSize: size, color: "currentColor" };

  if (
    normalizedTopic.includes("react") ||
    normalizedTopic.includes("component") ||
    normalizedTopic.includes("hooks") ||
    normalizedTopic.includes("jsx") ||
    normalizedTopic.includes("rendering") ||
    normalizedTopic.includes("fiber")
  ) {
    if (normalizedTopic.includes("hook"))
      return <MdWebhook style={reactIconStyle} />;
    if (normalizedTopic.includes("component"))
      return <Component {...iconProps} />;
    if (normalizedTopic.includes("fiber"))
      return <FaLayerGroup style={reactIconStyle} />;
    if (normalizedTopic.includes("reconciliation"))
      return <RefreshCw {...iconProps} />;
    if (normalizedTopic.includes("render")) return <Repeat {...iconProps} />;
    if (normalizedTopic.includes("state"))
      return <FolderKanban {...iconProps} />;
    if (normalizedTopic.includes("route")) return <Router {...iconProps} />;

    // Default React icon
    return <FaReact style={reactIconStyle} />;
  }

  // CSS and styling related topics
  if (
    normalizedTopic.includes("css") ||
    normalizedTopic.includes("style") ||
    normalizedTopic.includes("layout") ||
    normalizedTopic.includes("visual")
  ) {
    if (normalizedTopic.includes("layout"))
      return <LayoutGrid {...iconProps} />;
    if (normalizedTopic.includes("architecture"))
      return <MdArchitecture style={reactIconStyle} />;
    if (normalizedTopic.includes("performance"))
      return <Gauge {...iconProps} />;
    if (normalizedTopic.includes("visual")) return <Palette {...iconProps} />;
    if (normalizedTopic.includes("advanced")) return <Pipette {...iconProps} />;

    // Default CSS icon
    return <TbBrandCss3 style={reactIconStyle} />;
  }

  // JavaScript-specific topics
  if (
    normalizedTopic.includes("javascript") ||
    normalizedTopic.includes("js ") ||
    normalizedTopic.includes("dom") ||
    normalizedTopic.includes("event") ||
    normalizedTopic.includes("browser")
  ) {
    if (normalizedTopic.includes("dom")) return <AppWindow {...iconProps} />;
    if (normalizedTopic.includes("event")) return <BellRing {...iconProps} />;
    if (normalizedTopic.includes("loop")) return <TimerReset {...iconProps} />;
    if (normalizedTopic.includes("object"))
      return <FaRegObjectGroup style={reactIconStyle} />;
    if (normalizedTopic.includes("function"))
      return <PiFunctionFill {...iconProps} />;
    if (normalizedTopic.includes("scope"))
      return <BsWindow style={reactIconStyle} />;
    if (normalizedTopic.includes("browser")) return <Globe {...iconProps} />;
    if (normalizedTopic.includes("async")) return <Clock {...iconProps} />;
    if (normalizedTopic.includes("engine"))
      return <TbEngine style={reactIconStyle} />;
    if (normalizedTopic.includes("this")) return <Crosshair {...iconProps} />;

    // Default JavaScript icon
    return <SiJavascript style={reactIconStyle} />;
  }

  // TypeScript-specific topics
  if (
    normalizedTopic.includes("typescript") ||
    normalizedTopic.includes("ts ") ||
    normalizedTopic.includes("type") ||
    normalizedTopic.includes("interface")
  ) {
    if (normalizedTopic.includes("advanced type"))
      return <BiCodeCurly style={reactIconStyle} />;
    if (normalizedTopic.includes("generic")) return <Brackets {...iconProps} />;
    if (normalizedTopic.includes("object"))
      return <FaRegObjectGroup style={reactIconStyle} />;
    if (normalizedTopic.includes("system"))
      return <CircuitBoard {...iconProps} />;

    // Default TypeScript icon
    return <SiTypescript style={reactIconStyle} />;
  }

  if (
    normalizedTopic.includes("node") ||
    normalizedTopic.includes("express") ||
    normalizedTopic.includes("npm") ||
    normalizedTopic.includes("server") ||
    normalizedTopic.includes("api") ||
    normalizedTopic.includes("middleware")
  ) {
    if (normalizedTopic.includes("sequelize"))
      return <SiSequelize style={reactIconStyle} />;
    if (normalizedTopic.includes("express"))
      return <SiExpress style={reactIconStyle} />;
    if (normalizedTopic.includes("stream"))
      return <FaStream style={reactIconStyle} />;
    if (normalizedTopic.includes("module")) return <Puzzle {...iconProps} />;
    if (normalizedTopic.includes("http")) return <Network {...iconProps} />;
    if (normalizedTopic.includes("api"))
      return <TbApi style={reactIconStyle} />;
    if (normalizedTopic.includes("auth")) return <Lock {...iconProps} />;
    if (normalizedTopic.includes("passport"))
      return <SiPassport style={reactIconStyle} />;
    if (normalizedTopic.includes("worker"))
      return <GrUserWorker style={reactIconStyle} />;
    if (normalizedTopic.includes("middleware"))
      return <Workflow {...iconProps} />;
    if (
      normalizedTopic.includes("websocket") ||
      normalizedTopic.includes("socket")
    )
      return <Antenna {...iconProps} />;
    if (
      normalizedTopic.includes("message") ||
      normalizedTopic.includes("queue")
    )
      return <MessageCircle {...iconProps} />;
    if (normalizedTopic.includes("crypto")) return <Shield {...iconProps} />;
    if (normalizedTopic.includes("serverless")) return <Cloud {...iconProps} />;
    if (normalizedTopic.includes("mongoose"))
      return <SiMongodb style={reactIconStyle} />;

    if (normalizedTopic.includes("test"))
      return <GrTest style={reactIconStyle} />;
    if (normalizedTopic.includes("graph"))
      return <SiGraphql style={reactIconStyle} />;
    if (normalizedTopic.includes("deploy"))
      return <MdRocket style={reactIconStyle} />;
    if (normalizedTopic.includes("real time"))
      return <Activity {...iconProps} />;

    return <FaNodeJs style={reactIconStyle} />;
  }

  // Go-specific topics
  if (
    normalizedTopic.includes("go ") ||
    normalizedTopic.includes("golang") ||
    normalizedTopic.includes("goroutine") ||
    normalizedTopic.includes("concurrency")
  ) {
    if (normalizedTopic.includes("channels"))
      return <ImConnection style={reactIconStyle} />;
    if (normalizedTopic.includes("concurrency"))
      return <FaInfinity style={reactIconStyle} />;
    if (normalizedTopic.includes("context"))
      return <BsCompass style={reactIconStyle} />;
    if (normalizedTopic.includes("goroutine"))
      return <FaNetworkWired style={reactIconStyle} />;
    if (normalizedTopic.includes("scheduler"))
      return <Calendar {...iconProps} />;
    if (normalizedTopic.includes("memory")) return <MdMemory {...iconProps} />;
    if (normalizedTopic.includes("standard library"))
      return <FileStack {...iconProps} />;
    if (normalizedTopic.includes("sync"))
      return <MdSync style={reactIconStyle} />;
    if (normalizedTopic.includes("select")) return <Filter {...iconProps} />;

    // Default Go icon
    return <TbBrandGolang style={reactIconStyle} />;
  }

  // Python-specific topics
  if (
    normalizedTopic.includes("python") ||
    normalizedTopic.includes("django") ||
    normalizedTopic.includes("flask")
  ) {
    if (normalizedTopic.includes("object"))
      return <FaRegObjectGroup style={reactIconStyle} />;
    if (normalizedTopic.includes("concurrent"))
      return <IoIosGitNetwork style={reactIconStyle} />;
    if (normalizedTopic.includes("standard library"))
      return <FileStack {...iconProps} />;
    if (normalizedTopic.includes("data structure"))
      return <FaLayerGroup style={reactIconStyle} />;
    if (normalizedTopic.includes("algorithm"))
      return <BiBrain style={reactIconStyle} />;

    // Default Python icon
    return <TbBrandPython style={reactIconStyle} />;
  }

  // Docker-specific topics
  if (
    normalizedTopic.includes("docker") ||
    normalizedTopic.includes("container") ||
    normalizedTopic.includes("image")
  ) {
    if (normalizedTopic.includes("container"))
      return <Container {...iconProps} />;
    if (normalizedTopic.includes("image")) return <AppWindow {...iconProps} />;

    // Default Docker icon
    return <TbBrandDocker style={reactIconStyle} />;
  }

  // Git-specific topics
  if (
    normalizedTopic.includes("git") ||
    normalizedTopic.includes("branch") ||
    normalizedTopic.includes("merge") ||
    normalizedTopic.includes("rebase") ||
    normalizedTopic.includes("commit")
  ) {
    if (normalizedTopic.includes("branch")) return <GitBranch {...iconProps} />;
    if (normalizedTopic.includes("merge")) return <GitMerge {...iconProps} />;
    if (normalizedTopic.includes("rebase"))
      return <TbGitFork style={reactIconStyle} />;
    if (normalizedTopic.includes("object")) return <FileCode {...iconProps} />;
    if (normalizedTopic.includes("internal"))
      return <GitCommit {...iconProps} />;
    if (normalizedTopic.includes("basics"))
      return <RiGitRepositoryLine style={reactIconStyle} />;

    // Default Git icon
    return <BiGitRepoForked style={reactIconStyle} />;
  }

  // Redis-specific topics
  if (
    normalizedTopic.includes("redis") ||
    normalizedTopic.includes("cache") ||
    normalizedTopic.includes("pub sub")
  ) {
    if (normalizedTopic.includes("pub sub")) return <Antenna {...iconProps} />;
    if (normalizedTopic.includes("data structure"))
      return <FaLayerGroup style={reactIconStyle} />;
    if (normalizedTopic.includes("cache"))
      return <IoIosRefresh style={reactIconStyle} />;
    if (normalizedTopic.includes("persistance"))
      return <FaRegSave style={reactIconStyle} />;
    if (normalizedTopic.includes("command"))
      return <HiOutlineTerminal style={reactIconStyle} />;
    if (normalizedTopic.includes("architecture"))
      return <MdArchitecture style={reactIconStyle} />;

    // Default Redis icon
    return <SiRedis style={reactIconStyle} />;
  }

  // Tailwind-specific topics
  if (
    normalizedTopic.includes("tailwind") ||
    normalizedTopic.includes("utility") ||
    normalizedTopic.includes("css framework")
  ) {
    if (normalizedTopic.includes("layout"))
      return <LayoutGrid {...iconProps} />;

    // Default Tailwind icon
    return <SiTailwindcss style={reactIconStyle} />;
  }

  // GENERAL CONCEPT KEYWORDS MATCHING
  // Check for general concepts that appear across multiple technologies

  // Fundamentals concepts
  if (
    normalizedTopic.includes("fundamental") ||
    normalizedTopic.includes("core") ||
    normalizedTopic.includes("basic") ||
    normalizedTopic.includes("foundation")
  ) {
    return <BookOpen {...iconProps} />;
  }

  // Advanced concepts
  if (
    normalizedTopic.includes("advanced") ||
    normalizedTopic.includes("deep dive") ||
    normalizedTopic.includes("internals")
  ) {
    return <Lightbulb {...iconProps} />;
  }

  // Architecture related
  if (
    normalizedTopic.includes("architecture") ||
    normalizedTopic.includes("structure") ||
    normalizedTopic.includes("design")
  ) {
    return <MdArchitecture {...iconProps} />;
  }

  // Pattern related
  if (
    normalizedTopic.includes("pattern") ||
    normalizedTopic.includes("practice")
  ) {
    return <PuzzleIcon {...iconProps} />;
  }

  // Performance related
  if (
    normalizedTopic.includes("performance") ||
    normalizedTopic.includes("optimization") ||
    normalizedTopic.includes("efficient")
  ) {
    return <Gauge {...iconProps} />;
  }

  // Security related
  if (
    normalizedTopic.includes("security") ||
    normalizedTopic.includes("auth") ||
    normalizedTopic.includes("token") ||
    normalizedTopic.includes("encryption")
  ) {
    return <Shield {...iconProps} />;
  }

  // Data related
  if (
    normalizedTopic.includes("data") ||
    normalizedTopic.includes("storage") ||
    normalizedTopic.includes("database")
  ) {
    return <Database {...iconProps} />;
  }

  // API related
  if (
    normalizedTopic.includes("api") ||
    normalizedTopic.includes("endpoint") ||
    normalizedTopic.includes("service")
  ) {
    return <MdApi style={reactIconStyle} />;
  }

  // Concurrency and async
  if (
    normalizedTopic.includes("async") ||
    normalizedTopic.includes("concurrent") ||
    normalizedTopic.includes("parallel") ||
    normalizedTopic.includes("thread")
  ) {
    return <BiNetworkChart style={reactIconStyle} />;
  }

  // Testing related
  if (
    normalizedTopic.includes("test") ||
    normalizedTopic.includes("quality") ||
    normalizedTopic.includes("validation")
  ) {
    return <ClipboardCheck {...iconProps} />;
  }

  // Deployment related
  if (
    normalizedTopic.includes("deploy") ||
    normalizedTopic.includes("release") ||
    normalizedTopic.includes("continuous")
  ) {
    return <Rocket {...iconProps} />;
  }

  // LAYOUT RELATED
  if (
    normalizedTopic.includes("layout") ||
    normalizedTopic.includes("grid") ||
    normalizedTopic.includes("flex")
  ) {
    return <LayoutGrid {...iconProps} />;
  }

  // FUNCTIONAL CONCEPTS
  if (
    normalizedTopic.includes("function") ||
    normalizedTopic.includes("lambda") ||
    normalizedTopic.includes("callback")
  ) {
    return <PiFunctionFill {...iconProps} />;
  }

  // OBJECT-ORIENTED CONCEPTS
  if (
    normalizedTopic.includes("object") ||
    normalizedTopic.includes("class") ||
    normalizedTopic.includes("inheritance")
  ) {
    return <FaRegObjectGroup style={reactIconStyle} />;
  }

  // ALGORITHM & DATA STRUCTURE CONCEPTS
  if (
    normalizedTopic.includes("algorithm") ||
    normalizedTopic.includes("data structure") ||
    normalizedTopic.includes("complexity")
  ) {
    return <BiData style={reactIconStyle} />;
  }

  // STATE MANAGEMENT
  if (
    normalizedTopic.includes("state") ||
    normalizedTopic.includes("store") ||
    normalizedTopic.includes("context")
  ) {
    return <Workflow {...iconProps} />;
  }

  // RENDERING & UI
  if (
    normalizedTopic.includes("render") ||
    normalizedTopic.includes("display") ||
    normalizedTopic.includes("ui") ||
    normalizedTopic.includes("interface")
  ) {
    return <AppWindow {...iconProps} />;
  }

  // TOOLING & CONFIGURATION
  if (
    normalizedTopic.includes("tool") ||
    normalizedTopic.includes("config") ||
    normalizedTopic.includes("build")
  ) {
    return <Wrench {...iconProps} />;
  }

  // NETWORK & COMMUNICATION
  if (
    normalizedTopic.includes("network") ||
    normalizedTopic.includes("protocol") ||
    normalizedTopic.includes("http") ||
    normalizedTopic.includes("socket") ||
    normalizedTopic.includes("communication")
  ) {
    return <Globe {...iconProps} />;
  }

  // SYSTEM DESIGN
  if (
    normalizedTopic.includes("system") ||
    normalizedTopic.includes("design") ||
    normalizedTopic.includes("architecture")
  ) {
    return <LayoutDashboard {...iconProps} />;
  }

  // LAST RESORT - DEFAULT FALLBACKS BASED ON WORD PATTERNS

  // Check if it's an "implementation" topic
  if (normalizedTopic.includes("implementation")) {
    return <Hammer {...iconProps} />;
  }

  // Check if it's a "deep dive" topic
  if (normalizedTopic.includes("deep dive")) {
    return <Sparkles {...iconProps} />;
  }

  // Handle compound words that might be technologies
  if (normalizedTopic.includes("web")) {
    return <Globe {...iconProps} />;
  }

  if (normalizedTopic.includes("server")) {
    return <Server {...iconProps} />;
  }

  if (normalizedTopic.includes("client")) {
    return <AppWindow {...iconProps} />;
  }

  // ABSOLUTE FINAL DEFAULT
  // If we couldn't find a specific icon, use a generic code icon
  return <Code2 {...iconProps} />;
};

export default getTopicIcon;
