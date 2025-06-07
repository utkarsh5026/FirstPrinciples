import { Container, CloudAlert, LucideProps } from "lucide-react";
import {
  SiAmazons3,
  SiAmazondynamodb,
  SiAmazonec2,
  SiAmazoncloudwatch,
  SiAmazonrds,
  SiAwslambda,
  SiAmazonsqs,
  SiAmazonroute53,
  SiAmazoneks,
  SiAmazonapigateway,
} from "react-icons/si";
import { IconMapping } from "./types";

export const awsMappings: IconMapping[] = [
  {
    keywords: ["s3", "storage", "bucket"],
    icon: (props: LucideProps) => <SiAmazons3 {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["dynamodb", "dynamo", "nosql"],
    icon: (props: LucideProps) => <SiAmazondynamodb {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["ec2", "compute", "instance"],
    icon: (props: LucideProps) => <SiAmazonec2 {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["cloudwatch", "monitoring", "logs"],
    icon: (props: LucideProps) => <SiAmazoncloudwatch {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["rds", "database", "relational"],
    icon: (props: LucideProps) => <SiAmazonrds {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["lambda", "serverless", "function"],
    icon: (props: LucideProps) => <SiAwslambda {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["sqs", "queue", "message"],
    icon: (props: LucideProps) => <SiAmazonsqs {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["cloudfront", "cdn", "distribution"],
    icon: (props: LucideProps) => <CloudAlert {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["route53", "dns", "domain"],
    icon: (props: LucideProps) => <SiAmazonroute53 {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["eks", "kubernetes"],
    icon: (props: LucideProps) => <SiAmazoneks {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["ecr", "container", "registry"],
    icon: (props: LucideProps) => <Container {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["ecs", "container", "service"],
    icon: (props: LucideProps) => <Container {...props} />,
    isReactIcon: true,
  },
  {
    keywords: ["api gateway", "gateway"],
    icon: (props: LucideProps) => <SiAmazonapigateway {...props} />,
    isReactIcon: true,
  },
];
