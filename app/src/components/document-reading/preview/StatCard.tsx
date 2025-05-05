import { cn } from "@/lib/utils";
import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-secondary/10 rounded-lg p-3 border border-border/20 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <span className="text-xs ml-1.5">{label}</span>
        </div>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
};

export default StatCard;
