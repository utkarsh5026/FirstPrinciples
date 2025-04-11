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
 * StatCard component displays a card with a title, value, and optional subtitle, progress bar, and additional information.
 * It also includes a decorative icon.
 *
 * @param {StatCardProps} props - The props for the component.
 * @param {string} props.title - The title of the card.
 * @param {ReactNode} props.value - The value to be displayed on the card.
 * @param {ReactNode} [props.subtitle] - The subtitle of the card.
 * @param {ReactNode[]} [props.additionalInfo] - Additional information to be displayed on the card.
 * @param {number} [props.progressValue] - The value for the progress bar.
 * @param {{ left?: ReactNode; right?: ReactNode }} [props.progressLabels] - Labels for the progress bar.
 * @param {LucideIcon} props.icon - The icon to be displayed on the card.
 *
 * @returns {React.ReactElement} The StatCard component.
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
