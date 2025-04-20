// src/components/chart/ChartTooltip.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/**
 * Section data for tooltip content
 */
export interface TooltipSectionData {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Footer message with optional icon
 */
export interface TooltipFooterData {
  message: string;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Props for the ChartTooltip component
 */
export interface ChartTooltipProps {
  /** Main title or header for the tooltip */
  title: React.ReactNode;
  /** Optional subtitle or context */
  subtitle?: React.ReactNode;
  /** Icon component to display next to the title */
  icon?: LucideIcon;
  /** Additional class name for the title section */
  titleClassName?: string;
  /** Array of sections to display in the tooltip body */
  sections: TooltipSectionData[];
  /** Optional footer message with highlight styling */
  footer?: TooltipFooterData;
  /** Additional class name for the container */
  className?: string;
}

/**
 * ChartTooltip - A reusable, consistent tooltip component for data visualizations
 *
 * This component provides a standardized way to display tooltip information across
 * different chart types while maintaining visual consistency. It supports:
 *
 * - Header with icon and title
 * - Multiple content sections with label/value pairs
 * - Optional highlight styling for important values
 * - Optional footer with icon and message
 * - Consistent styling with the application design system
 * - Motion animations for enhanced UX
 */
const ChartTooltip: React.FC<ChartTooltipProps> = ({
  title,
  subtitle,
  icon: Icon,
  titleClassName,
  sections,
  footer,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-lg rounded-lg p-3 border border-border",
        className
      )}
    >
      {/* Header Section */}
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border/50 pb-1.5 mb-1.5",
          titleClassName
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        <div className="flex flex-col">
          <p className="text-sm font-medium flex items-center">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-1">
        {sections.map((section, idx) => {
          const SectionIcon = section.icon;

          return (
            <div
              key={`section-${idx}`}
              className="flex justify-between gap-4 text-xs items-center"
            >
              <span className="text-muted-foreground flex items-center gap-1">
                {SectionIcon && <SectionIcon className="h-3 w-3 opacity-70" />}
                {section.label}
              </span>
              <span
                className={cn(
                  section.highlight ? "font-bold text-primary" : "font-medium",
                  section.className
                )}
              >
                {section.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Section */}
      {footer && (
        <div
          className={cn(
            "mt-2 pt-1.5 border-t border-border/50 text-xs flex items-center",
            footer.className || "text-green-400"
          )}
        >
          {footer.icon && <footer.icon className="h-3 w-3 mr-1" />}
          {footer.message}
        </div>
      )}
    </div>
  );
};

export default ChartTooltip;
