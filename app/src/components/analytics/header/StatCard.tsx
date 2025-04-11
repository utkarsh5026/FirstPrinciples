import React, { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  additionalInfo?: ReactNode[];
  progressValue?: number;
  progressLabels?: { left?: ReactNode; right?: ReactNode };
  icon: LucideIcon;
}

/**
 * ✨ StatCard Component ✨
 *
 * A beautiful card component that displays statistics in a visually appealing way!
 *
 * 🎯 Purpose:
 * This component creates an elegant card to showcase important metrics and statistics
 * with a clean, modern design. Perfect for dashboards and analytics sections!
 *
 * 🧩 Features:
 * - Displays a title and prominent value
 * - Shows optional subtitle for additional context
 * - Includes a decorative icon for visual appeal
 * - Can display a progress bar with customizable labels
 * - Supports multiple lines of additional information
 * - Responsive design with careful spacing
 *
 * 💡 Usage:
 * Ideal for displaying user metrics, achievements, progress tracking,
 * and any key performance indicators that need visual emphasis.
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  additionalInfo,
  progressValue,
  progressLabels,
  icon: Icon,
}) => {
  return (
    <Card className="p-4 border-primary/10 relative overflow-hidden rounded-2xl border-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-2 flex items-baseline">
        <span className="text-2xl font-bold">{value}</span>
        {subtitle && (
          <span className="ml-2 text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>

      {progressValue !== undefined && (
        <div className="mt-2">
          <Progress value={progressValue} className="h-1.5" />
        </div>
      )}

      {progressLabels && (
        <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
          {progressLabels.left && <span>{progressLabels.left}</span>}
          {progressLabels.right && <span>{progressLabels.right}</span>}
        </div>
      )}

      {additionalInfo?.map((info, index) => {
        const itemIndex = typeof info === "string" ? info : index;
        const itemKey =
          React.isValidElement(info) && info.key
            ? info.key
            : `info-item-${itemIndex}`;

        return (
          <div key={itemKey} className="mt-2 text-xs text-muted-foreground">
            {info}
          </div>
        );
      })}

      {/* Decorative element */}
      <div className="absolute -right-3 -top-3 opacity-10">
        <Icon className="h-16 w-16 text-primary" />
      </div>
    </Card>
  );
};

export default StatCard;
