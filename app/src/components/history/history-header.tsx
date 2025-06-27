import React from "react";
import {
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  Award,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import CardContainer from "@/components/shared/container/CardContainer";

interface HistoryHeaderProps {
  timeStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
}

/**
 * Enhanced HistoryHeader Component
 *
 * A visually appealing header for the history section that displays
 * time-based statistics and view mode selection options.
 */
const HistoryHeader: React.FC<HistoryHeaderProps> = ({ timeStats }) => {
  return (
    <CardContainer
      title="History Overview"
      icon={CalendarDays}
      description="Track your reading journey and discover patterns 🤗"
      variant="subtle"
      className="shadow-sm shadow-primary"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard
          label="Today"
          value={timeStats.today}
          icon={CalendarDays}
          iconColor="text-blue-400"
        />
        <StatCard
          label="This Week"
          value={timeStats.thisWeek}
          icon={CalendarRange}
          iconColor="text-green-400"
        />
        <StatCard
          label="This Month"
          value={timeStats.thisMonth}
          icon={CalendarCheck}
          iconColor="text-purple-400"
        />
        <StatCard
          label="Total"
          value={timeStats.total}
          highlight
          icon={Award}
          iconColor="text-amber-400"
        />
      </div>
    </CardContainer>
  );
};

/**
 * StatCard Component
 *
 * A visually attractive card to display statistical information
 */
const StatCard: React.FC<{
  label: string;
  value: number;
  highlight?: boolean;
  icon?: React.ElementType;
  iconColor?: string;
}> = ({ label, value, highlight, icon: Icon, iconColor = "text-primary" }) => {
  return (
    <Card
      className={`p-3 flex flex-row rounded-2xl items-center justify-between transition-all duration-200 hover:shadow-md ${
        highlight ? "border-primary/20 bg-primary/5" : "border-secondary/30"
      }`}
    >
      <div className="flex flex-col">
        <span className="text-base md:text-lg font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      {Icon && (
        <div
          className={`flex items-center justify-center ${iconColor} opacity-80`}
        >
          <Icon className="h-6 w-6 md:h-8 md:w-8" />
        </div>
      )}
    </Card>
  );
};

export default HistoryHeader;
