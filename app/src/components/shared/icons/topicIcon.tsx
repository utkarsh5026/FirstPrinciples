import React from "react";
import { Code2 } from "lucide-react";
import getIconForTech from "./iconMap";
import {
  reactMappings,
  cssMappings,
  javascriptMappings,
  typescriptMappings,
  nodejsMappings,
  awsMappings,
  dataStructureMappings,
  generalConceptMappings,
  goMappings,
  pythonMappings,
  dockerMappings,
  gitMappings,
  redisMappings,
  tailwindMappings,
  fallbackMappings,
  getIconProps,
  getReactIconStyle,
} from "./mappings";
import type { IconMapping } from "./mappings";

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
