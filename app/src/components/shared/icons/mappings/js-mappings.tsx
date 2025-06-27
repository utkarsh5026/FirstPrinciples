import {
  AppWindow,
  BellRing,
  TimerReset,
  Globe,
  Clock,
  Crosshair,
  LucideProps,
} from "lucide-react";
import { FaRegObjectGroup } from "react-icons/fa";
import { PiFunctionFill } from "react-icons/pi";
import { BsWindow } from "react-icons/bs";
import { TbEngine } from "react-icons/tb";
import { SiJavascript } from "react-icons/si";
import { IconMapping } from "./types";

export const javascriptMappings: IconMapping[] = [
  { keywords: ["dom"], icon: (props: LucideProps) => <AppWindow {...props} /> },
  {
    keywords: ["event"],
    icon: (props: LucideProps) => <BellRing {...props} />,
  },
  {
    keywords: ["loop"],
    icon: (props: LucideProps) => <TimerReset {...props} />,
  },
  {
    keywords: ["object"],
    icon: (props: LucideProps) => <FaRegObjectGroup {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["function"],
    icon: (props: LucideProps) => <PiFunctionFill {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["scope"],
    icon: (props: LucideProps) => <BsWindow {...props} />,
    isReactIcon: true,
  },
  { keywords: ["browser"], icon: (props: LucideProps) => <Globe {...props} /> },
  { keywords: ["async"], icon: (props: LucideProps) => <Clock {...props} /> },
  {
    keywords: ["engine"],
    icon: (props: LucideProps) => <TbEngine {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["this"],
    icon: (props: LucideProps) => <Crosshair {...props} />,
  },
  {
    keywords: ["javascript", "js"],
    icon: (props: LucideProps) => <SiJavascript {...props} />,
    isReactIcon: true,
  },
];
