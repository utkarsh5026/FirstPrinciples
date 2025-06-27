import { Brackets, CircuitBoard, LucideProps } from "lucide-react";
import { BiCodeCurly } from "react-icons/bi";
import { FaRegObjectGroup } from "react-icons/fa";
import { SiTypescript } from "react-icons/si";
import { IconMapping } from "./types";

export const typescriptMappings: IconMapping[] = [
  {
    keywords: ["advanced type"],
    icon: (props: LucideProps) => <BiCodeCurly {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["generic"],
    icon: (props: LucideProps) => <Brackets {...props} />,
  },
  {
    keywords: ["object"],
    icon: (props: LucideProps) => <FaRegObjectGroup {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["system"],
    icon: (props: LucideProps) => <CircuitBoard {...props} />,
  },
  {
    keywords: ["typescript", "ts ", "type", "interface"],
    icon: (props: LucideProps) => <SiTypescript {...props} />,
    isReactIcon: true,
  },
];
