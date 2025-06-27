import { LayoutGrid, Gauge, Palette, Pipette, LucideProps } from "lucide-react";
import { MdAnimation, MdArchitecture } from "react-icons/md";
import { TbBrandCss3 } from "react-icons/tb";
import { IconMapping } from "./types";

export const cssMappings: IconMapping[] = [
  {
    keywords: ["layout"],
    icon: (props: LucideProps) => <LayoutGrid {...props} />,
  },
  {
    keywords: ["animation", "animate"],
    icon: (props: LucideProps) => <MdAnimation {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["architecture"],
    icon: (props: LucideProps) => <MdArchitecture {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["performance"],
    icon: (props: LucideProps) => <Gauge {...props} />,
  },
  {
    keywords: ["visual"],
    icon: (props: LucideProps) => <Palette {...props} />,
  },
  {
    keywords: ["advanced"],
    icon: (props: LucideProps) => <Pipette {...props} />,
  },
  {
    keywords: ["css", "style", "styling"],
    icon: (props: LucideProps) => <TbBrandCss3 {...props} />,
    isReactIcon: true,
  },
];
