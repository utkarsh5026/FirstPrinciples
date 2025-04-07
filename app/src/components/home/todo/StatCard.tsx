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
  <Card className="p-4 border-primary/10 hover:border-primary/30 transition-colors bg-secondary/5 rounded-2xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold">
          {value}
          {suffix}
        </p>
      </div>
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
    </div>
  </Card>
);

export default StatCard;
