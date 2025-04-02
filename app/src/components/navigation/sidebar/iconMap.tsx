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
  SiGitlab,
  SiFigma,
  SiAdobexd,
  SiLinux,
  SiApple,
  SiAndroid,
  SiIos,
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
  SiBootstrap,
  SiChakraui,
  SiGraphql,
  SiApollographql,
  SiFirebase,
  SiSupabase,
  SiVercel,
  SiNetlify,
  SiHeroku,
  SiDigitalocean,
  SiMarkdown,
  SiJson,
  SiYaml,
  SiGnubash,
  SiElixir,
  SiHaskell,
  SiVim,
  SiJetbrains,
  SiEclipseide,
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
  nodejs: SiNodedotjs,
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
  gitlab: SiGitlab,

  // Design
  figma: SiFigma,
  "adobe xd": SiAdobexd,
  xd: SiAdobexd,

  // Operating Systems
  linux: SiLinux,
  macos: SiApple,
  mac: SiApple,
  android: SiAndroid,
  ios: SiIos,

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
  bootstrap: SiBootstrap,
  chakra: SiChakraui,
  "chakra-ui": SiChakraui,

  // API and Backend as a Service
  graphql: SiGraphql,
  apollo: SiApollographql,
  firebase: SiFirebase,
  supabase: SiSupabase,

  // Hosting & Deployment
  vercel: SiVercel,
  netlify: SiNetlify,
  heroku: SiHeroku,
  digitalocean: SiDigitalocean,

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
  eclipse: SiEclipseide,

  // Default fallbacks
  file: FiFile,
  doc: FiFileText,
  document: FiFileText,
  code: FiCode,
  folder: FiFolder,
  folders: FiFolderPlus,
};

/**
 * Gets the icon component for a given technology/language name
 * @param name The name of the technology/language (case insensitive)
 * @returns The corresponding icon component or a default folder icon
 */
export const getIconForTech = (name?: string): IconType => {
  if (!name) return FiFolder;

  const normalizedName = name.toLowerCase().trim();
  return iconMap[normalizedName] || FiFolder;
};

export default getIconForTech;
