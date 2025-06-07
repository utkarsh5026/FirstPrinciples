import {
  Puzzle,
  Lock,
  Workflow,
  MessageCircle,
  Shield,
  Cloud,
  Activity,
  LucideProps,
} from "lucide-react";
import { FaStream, FaNodeJs } from "react-icons/fa";
import {
  SiGraphql,
  SiSequelize,
  SiTypeorm,
  SiExpress,
  SiPassport,
  SiMongodb,
  SiSocketdotio,
} from "react-icons/si";
import { MdHttp, MdRocket } from "react-icons/md";
import { TbApi } from "react-icons/tb";
import { GrUserWorker, GrTest } from "react-icons/gr";
import { IconMapping } from "./types";

export const nodejsMappings: IconMapping[] = [
  {
    keywords: ["graph"],
    icon: (props: LucideProps) => <SiGraphql {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["sequelize"],
    icon: (props: LucideProps) => <SiSequelize {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["typeorm"],
    icon: (props: LucideProps) => <SiTypeorm {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["express"],
    icon: (props: LucideProps) => <SiExpress {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["stream", "event"],
    icon: (props: LucideProps) => <FaStream {...props} />,
    isReactIcon: true,
  },
  { keywords: ["module"], icon: (props: LucideProps) => <Puzzle {...props} /> },
  {
    keywords: ["http"],
    icon: (props: LucideProps) => <MdHttp {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["api"],
    icon: (props: LucideProps) => <TbApi {...props} />,
    isReactIcon: true,
  },
  { keywords: ["auth"], icon: (props: LucideProps) => <Lock {...props} /> },
  {
    keywords: ["passport"],
    icon: (props: LucideProps) => <SiPassport {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["worker"],
    icon: (props: LucideProps) => <GrUserWorker {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["middleware"],
    icon: (props: LucideProps) => <Workflow {...props} />,
  },
  {
    keywords: ["websocket", "socket"],
    icon: (props: LucideProps) => <SiSocketdotio {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["message", "queue"],
    icon: (props: LucideProps) => <MessageCircle {...props} />,
  },
  { keywords: ["crypto"], icon: (props: LucideProps) => <Shield {...props} /> },
  {
    keywords: ["serverless"],
    icon: (props: LucideProps) => <Cloud {...props} />,
  },
  {
    keywords: ["mongoose"],
    icon: (props: LucideProps) => <SiMongodb {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["test"],
    icon: (props: LucideProps) => <GrTest {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["deploy"],
    icon: (props: LucideProps) => <MdRocket {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["real time"],
    icon: (props: LucideProps) => <Activity {...props} />,
  },
  {
    keywords: ["server", "npm"],
    icon: (props: LucideProps) => <FaNodeJs {...props} />,
    isReactIcon: true,
  },
];
