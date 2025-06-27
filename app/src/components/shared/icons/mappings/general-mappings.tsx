import {
  BookOpen,
  Lightbulb,
  PuzzleIcon,
  Gauge,
  Shield,
  Database,
  ClipboardCheck,
  Rocket,
  LayoutGrid,
  AppWindow,
  Wrench,
  Globe,
  LayoutDashboard,
  Workflow,
  Hammer,
  Sparkles,
  Server,
  Container,
  Calendar,
  FileStack,
  Filter,
  Antenna,
  LucideProps,
} from "lucide-react";
import {
  FaRegObjectGroup,
  FaLayerGroup,
  FaInfinity,
  FaNetworkWired,
  FaRegSave,
} from "react-icons/fa";
import { PiFunctionFill } from "react-icons/pi";
import { BiNetworkChart, BiData } from "react-icons/bi";
import { BsCompass } from "react-icons/bs";
import {
  MdLocalLibrary,
  MdArchitecture,
  MdApi,
  MdMemory,
  MdSync,
} from "react-icons/md";
import { SiInstructure, SiRedis, SiTailwindcss } from "react-icons/si";
import {
  TbBrandDocker,
  TbBrandGolang,
  TbBrandPython,
  TbGitFork,
} from "react-icons/tb";
import { ImConnection } from "react-icons/im";
import { IoIosRefresh } from "react-icons/io";
import { HiOutlineTerminal } from "react-icons/hi";
import { RiGitRepositoryLine } from "react-icons/ri";
import { BiGitRepoForked } from "react-icons/bi";
import { IconMapping } from "./types";

export const generalConceptMappings: IconMapping[] = [
  {
    keywords: ["library", "libraries"],
    icon: (props: LucideProps) => <MdLocalLibrary {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["structure", "struct"],
    icon: (props: LucideProps) => <SiInstructure {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["fundamental", "core", "basic", "foundation"],
    icon: (props: LucideProps) => <BookOpen {...props} />,
  },
  {
    keywords: ["advanced", "deep dive", "internals"],
    icon: (props: LucideProps) => <Lightbulb {...props} />,
  },
  {
    keywords: ["architecture", "structure", "design"],
    icon: (props: LucideProps) => <MdArchitecture {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["pattern", "practice"],
    icon: (props: LucideProps) => <PuzzleIcon {...props} />,
  },
  {
    keywords: ["performance", "optimization", "efficient"],
    icon: (props: LucideProps) => <Gauge {...props} />,
  },
  {
    keywords: ["security", "auth", "token", "encryption"],
    icon: (props: LucideProps) => <Shield {...props} />,
  },
  {
    keywords: ["data", "storage", "database"],
    icon: (props: LucideProps) => <Database {...props} />,
  },
  {
    keywords: ["api", "endpoint", "service"],
    icon: (props: LucideProps) => <MdApi {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["async", "concurrent", "parallel", "thread"],
    icon: (props: LucideProps) => <BiNetworkChart {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["test", "quality", "validation"],
    icon: (props: LucideProps) => <ClipboardCheck {...props} />,
  },
  {
    keywords: ["deploy", "release", "continuous", "production"],
    icon: (props: LucideProps) => <Rocket {...props} />,
  },
  {
    keywords: ["layout", "grid", "flex"],
    icon: (props: LucideProps) => <LayoutGrid {...props} />,
  },
  {
    keywords: ["function", "lambda", "callback"],
    icon: (props: LucideProps) => <PiFunctionFill {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["object", "class", "inheritance"],
    icon: (props: LucideProps) => <FaRegObjectGroup {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["algorithm", "data structure", "complexity"],
    icon: (props: LucideProps) => <BiData {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["state", "store", "context"],
    icon: (props: LucideProps) => <Workflow {...props} />,
  },
  {
    keywords: ["render", "display", "ui", "interface"],
    icon: (props: LucideProps) => <AppWindow {...props} />,
  },
  {
    keywords: ["tool", "config", "build"],
    icon: (props: LucideProps) => <Wrench {...props} />,
  },
  {
    keywords: ["network", "protocol", "http", "socket", "communication"],
    icon: (props: LucideProps) => <Globe {...props} />,
  },
  {
    keywords: ["system", "design"],
    icon: (props: LucideProps) => <LayoutDashboard {...props} />,
  },
];

export const goMappings: IconMapping[] = [
  {
    keywords: ["channel"],
    icon: (props: LucideProps) => <ImConnection {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["concurrency"],
    icon: (props: LucideProps) => <FaInfinity {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["context"],
    icon: (props: LucideProps) => <BsCompass {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["goroutine"],
    icon: (props: LucideProps) => <FaNetworkWired {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["scheduler"],
    icon: (props: LucideProps) => <Calendar {...props} />,
  },
  {
    keywords: ["memory"],
    icon: (props: LucideProps) => <MdMemory {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["standard library"],
    icon: (props: LucideProps) => <FileStack {...props} />,
  },
  {
    keywords: ["sync"],
    icon: (props: LucideProps) => <MdSync {...props} />,
    isReactIcon: true,
  },
  { keywords: ["select"], icon: (props: LucideProps) => <Filter {...props} /> },
  {
    keywords: ["go ", "golang"],
    icon: (props: LucideProps) => <TbBrandGolang {...props} />,
    isReactIcon: true,
  },
];

export const pythonMappings: IconMapping[] = [
  {
    keywords: ["object"],
    icon: (props: LucideProps) => <FaRegObjectGroup {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["concurrent"],
    icon: (props: LucideProps) => <BiNetworkChart {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["standard library"],
    icon: (props: LucideProps) => <FileStack {...props} />,
  },
  {
    keywords: ["data structure"],
    icon: (props: LucideProps) => <FaLayerGroup {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["algorithm"],
    icon: (props: LucideProps) => <BiData {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["python", "django", "flask"],
    icon: (props: LucideProps) => <TbBrandPython {...props} />,
    isReactIcon: true,
  },
];

export const dockerMappings: IconMapping[] = [
  {
    keywords: ["container"],
    icon: (props: LucideProps) => <Container {...props} />,
  },
  {
    keywords: ["image"],
    icon: (props: LucideProps) => <AppWindow {...props} />,
  },
  {
    keywords: ["docker"],
    icon: (props: LucideProps) => <TbBrandDocker {...props} />,
    isReactIcon: true,
  },
];

export const gitMappings: IconMapping[] = [
  {
    keywords: ["rebase"],
    icon: (props: LucideProps) => <TbGitFork {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["basics"],
    icon: (props: LucideProps) => <RiGitRepositoryLine {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["git", "commit"],
    icon: (props: LucideProps) => <BiGitRepoForked {...props} />,
    isReactIcon: true,
  },
];

export const redisMappings: IconMapping[] = [
  {
    keywords: ["pub sub"],
    icon: (props: LucideProps) => <Antenna {...props} />,
  },
  {
    keywords: ["data structure"],
    icon: (props: LucideProps) => <FaLayerGroup {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["cache"],
    icon: (props: LucideProps) => <IoIosRefresh {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["persistance"],
    icon: (props: LucideProps) => <FaRegSave {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["command"],
    icon: (props: LucideProps) => <HiOutlineTerminal {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["architecture"],
    icon: (props: LucideProps) => <MdArchitecture {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["redis"],
    icon: (props: LucideProps) => <SiRedis {...props} />,
    isReactIcon: true,
  },
];

export const tailwindMappings: IconMapping[] = [
  {
    keywords: ["layout"],
    icon: (props: LucideProps) => <LayoutGrid {...props} />,
  },
  {
    keywords: ["tailwind", "utility", "css framework"],
    icon: (props: LucideProps) => <SiTailwindcss {...props} />,
    isReactIcon: true,
  },
];

export const fallbackMappings: IconMapping[] = [
  {
    keywords: ["implementation"],
    icon: (props: LucideProps) => <Hammer {...props} />,
  },
  {
    keywords: ["deep dive"],
    icon: (props: LucideProps) => <Sparkles {...props} />,
  },
  { keywords: ["web"], icon: (props: LucideProps) => <Globe {...props} /> },
  { keywords: ["server"], icon: (props: LucideProps) => <Server {...props} /> },
  {
    keywords: ["client"],
    icon: (props: LucideProps) => <AppWindow {...props} />,
  },
];
