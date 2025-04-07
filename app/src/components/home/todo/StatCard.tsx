import React from "react";
import { Card } from "@/components/ui/card";
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  suffix = "",
}) => (
  <Card className="p-3 sm:p-4 border-primary/10 hover:border-primary/30 transition-colors bg-secondary/5 rounded-xl sm:rounded-2xl">
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5 sm:mb-1">{label}</p>
        <p className="text-xl sm:text-2xl font-bold truncate">
          {value}
          {suffix}
        </p>
      </div>
      <div className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
    </div>
  </Card>
);

export default StatCard;
