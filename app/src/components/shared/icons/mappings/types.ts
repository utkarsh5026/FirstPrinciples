import { LucideProps } from "lucide-react";
import React from "react";

export type IconMapping = {
  keywords: string[];
  icon: (props: LucideProps) => React.ReactElement;
  isReactIcon?: boolean;
};

export const getIconProps = (size: number): LucideProps => ({
  size,
  className: "flex-shrink-0",
});

export const getReactIconStyle = (size: number) => ({
  fontSize: size,
  color: "currentColor",
});
