import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiCplusplus,
  SiC,
  SiRuby,
  SiPhp,
  SiGo,
  SiRust,
  SiSwift,
  SiKotlin,
  SiDart,
  SiReact,
  SiAngular,
  SiVuedotjs,
  SiSvelte,
  SiNextdotjs,
  SiNuxtdotjs,
  SiLaravel,
  SiDjango,
  SiFlask,
  SiNodedotjs,
  SiExpress,
  SiSpring,
  SiDotnet,
  SiMongodb,
  SiMysql,
  SiPostgresql,
  SiSqlite,
  SiRedis,
  SiDocker,
  SiKubernetes,
  SiGooglecloud,
  SiGit,
  SiGithub,
  SiLinux,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
  SiPandas,
  SiNumpy,
  SiJupyter,
  SiMlflow,
  SiHtml5,
  SiCss3,
  SiSass,
  SiTailwindcss,
  SiGraphql,
  SiMarkdown,
  SiJson,
  SiYaml,
  SiGnubash,
  SiElixir,
  SiHaskell,
  SiVim,
  SiJetbrains,
} from "react-icons/si";
import {
  FiFolder,
  FiFolderPlus,
  FiFile,
  FiFileText,
  FiDatabase,
  FiServer,
  FiCloud,
  FiCpu,
  FiCode,
  FiPackage,
} from "react-icons/fi";
import { IconType } from "react-icons";

// Map of technology/language names to their corresponding icons
export const iconMap: Record<string, IconType> = {
  // Programming Languages
  python: SiPython,
  javascript: SiJavascript,
  js: SiJavascript,
  typescript: SiTypescript,
  ts: SiTypescript,
  "c++": SiCplusplus,
  cpp: SiCplusplus,
  c: SiC,
  ruby: SiRuby,
  php: SiPhp,
  go: SiGo,
  golang: SiGo,
  rust: SiRust,
  swift: SiSwift,
  kotlin: SiKotlin,
  dart: SiDart,
  elixir: SiElixir,
  haskell: SiHaskell,

  // Frontend Frameworks/Libraries
  react: SiReact,
  reactjs: SiReact,
  angular: SiAngular,
  vue: SiVuedotjs,
  vuejs: SiVuedotjs,
  svelte: SiSvelte,
  next: SiNextdotjs,
  nextjs: SiNextdotjs,
  nuxt: SiNuxtdotjs,
  nuxtjs: SiNuxtdotjs,

  // Backend Frameworks
  laravel: SiLaravel,
  django: SiDjango,
  flask: SiFlask,
  node: SiNodedotjs,
  node_js: SiNodedotjs,
  express: SiExpress,
  spring: SiSpring,
  dotnet: SiDotnet,

  // Databases
  mongodb: SiMongodb,
  mysql: SiMysql,
  postgres: SiPostgresql,
  postgresql: SiPostgresql,
  sqlite: SiSqlite,
  redis: SiRedis,
  database: FiDatabase,

  // DevOps and Cloud
  docker: SiDocker,
  kubernetes: SiKubernetes,
  k8s: SiKubernetes,
  gcp: SiGooglecloud,
  "google cloud": SiGooglecloud,
  cloud: FiCloud,
  server: FiServer,

  // Version Control
  git: SiGit,
  github: SiGithub,

  // Operating Systems
  linux: SiLinux,

  // ML/AI
  tensorflow: SiTensorflow,
  pytorch: SiPytorch,
  "scikit-learn": SiScikitlearn,
  pandas: SiPandas,
  numpy: SiNumpy,
  jupyter: SiJupyter,
  mlflow: SiMlflow,
  "machine learning": FiCpu,
  ai: FiCpu,

  // Web technologies
  html: SiHtml5,
  html5: SiHtml5,
  css: SiCss3,
  css3: SiCss3,
  sass: SiSass,
  scss: SiSass,
  tailwind: SiTailwindcss,
  tailwindcss: SiTailwindcss,

  // API and Backend as a Service
  graphql: SiGraphql,

  // Markup & Config
  markdown: SiMarkdown,
  md: SiMarkdown,
  json: SiJson,
  yaml: SiYaml,
  yml: SiYaml,

  // Shell and Scripting
  bash: SiGnubash,
  shell: SiGnubash,

  // IDEs & Editors
  vim: SiVim,
  jetbrains: SiJetbrains,

  // Default fallbacks
  file: FiFile,
  doc: FiFileText,
  document: FiFileText,
  code: FiCode,
  folder: FiFolder,
  folders: FiFolderPlus,
  design_principles: FiPackage,
  design_patterns: FiPackage,
};

/**
 * Gets the icon component for a given technology/language name
 * @param name The name of the technology/language (case insensitive)
 * @returns The corresponding icon component or a default folder icon
 */
export const getIconForTech = (name?: string): IconType => {
  if (!name) return FiFolder;

  const normalizedName = name.split(" ").join("_").toLowerCase().trim();
  return iconMap[normalizedName] || FiFolder;
};

export default getIconForTech;
