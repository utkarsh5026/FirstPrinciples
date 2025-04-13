import React, { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  additionalInfo?: ReactNode[];
  progressValue?: number;
  progressLabels?: { left?: ReactNode; right?: ReactNode };
  icon: LucideIcon;
  colorScheme?: "primary" | "success" | "info" | "warning" | "default";
  className?: string;
}

/**
 * Modern, clean StatCard component for displaying analytics data
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  additionalInfo,
  progressValue,
  progressLabels,
  icon: Icon,
  colorScheme = "default",
  className,
}) => {
  // Define color classes based on colorScheme
  const getColorClasses = () => {
    switch (colorScheme) {
      case "primary":
        return {
          accent: "bg-primary",
          text: "text-primary",
          iconBg: "bg-primary/10",
          progress: "bg-primary",
        };
      case "success":
        return {
          accent: "bg-emerald-500",
          text: "text-emerald-500",
          iconBg: "bg-emerald-500/10",
          progress: "bg-emerald-500",
        };
      case "info":
        return {
          accent: "bg-blue-500",
          text: "text-blue-500",
          iconBg: "bg-blue-500/10",
          progress: "bg-blue-500",
        };
      case "warning":
      default:
        return {
          accent: "bg-amber-500",
          text: "text-amber-500",
          iconBg: "bg-amber-500/10",
          progress: "bg-amber-500",
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={cn("h-full", className)}
    >
      <Card className="h-full p-0 overflow-hidden border rounded-2xl shadow-sm">
        {/* Color accent at top */}
        <div className={cn("h-1.5 w-full", colorClasses.accent)} />

        <div className="p-5 -mt-4">
          {/* Header with icon and title */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </h3>
            <div className={cn("p-2 rounded-full", colorClasses.iconBg)}>
              <Icon className={cn("h-4 w-4", colorClasses.text)} />
            </div>
          </div>

          {/* Main value and subtitle */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{value}</span>
              {subtitle && (
                <span className="text-xs text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {progressValue !== undefined && (
            <div className="mb-3">
              <div className="bg-muted/30 h-2 w-full rounded overflow-hidden">
                <div
                  className={cn("h-full rounded", colorClasses.progress)}
                  style={{ width: `${progressValue}%` }}
                />
              </div>

              {progressLabels && (
                <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                  {progressLabels.left && <span>{progressLabels.left}</span>}
                  {progressLabels.right && <span>{progressLabels.right}</span>}
                </div>
              )}
            </div>
          )}

          {/* Additional info */}
          {additionalInfo && additionalInfo.length > 0 && (
            <div className="space-y-1.5">
              {additionalInfo.map((info, index) => {
                const itemKey =
                  React.isValidElement(info) && info.key
                    ? info.key
                    : `info-item-${index}`;

                return (
                  <div key={itemKey} className="text-xs text-muted-foreground">
                    {info}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;
