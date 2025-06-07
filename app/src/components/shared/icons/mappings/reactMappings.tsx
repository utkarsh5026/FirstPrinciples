import {
  Component,
  RefreshCw,
  Repeat,
  FolderKanban,
  LucideProps,
} from "lucide-react";
import { FaLayerGroup } from "react-icons/fa";
import { MdWebhook, MdAltRoute } from "react-icons/md";
import { SiAxios } from "react-icons/si";
import { IconMapping } from "./types";

export const reactMappings: IconMapping[] = [
  {
    keywords: ["hook"],
    icon: (props: LucideProps) => <MdWebhook {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["axios"],
    icon: (props: LucideProps) => <SiAxios {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["component"],
    icon: (props: LucideProps) => <Component {...props} />,
  },
  {
    keywords: ["fiber"],
    icon: (props: LucideProps) => <FaLayerGroup {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["reconciliation"],
    icon: (props: LucideProps) => <RefreshCw {...props} />,
  },
  { keywords: ["render"], icon: (props: LucideProps) => <Repeat {...props} /> },
  {
    keywords: ["state"],
    icon: (props: LucideProps) => <FolderKanban {...props} />,
  },
  {
    keywords: ["route", "routing"],
    icon: (props: LucideProps) => <MdAltRoute {...props} />,
  },
];
