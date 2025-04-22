import React from "react";
import {
  LayoutList,
  Clock,
  BarChart2,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  Award,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CardContainer from "@/components/container/CardContainer";

interface HistoryHeaderProps {
  timeStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  viewMode: "list" | "timeline" | "trends";
  setViewMode: (mode: "list" | "timeline" | "trends") => void;
}

/**
 * Enhanced HistoryHeader Component
 *
 * A visually appealing header for the history section that displays
 * time-based statistics and view mode selection options.
 */
const HistoryHeader: React.FC<HistoryHeaderProps> = ({
  timeStats,
  viewMode,
  setViewMode,
}) => {
  const viewModeOptions = [
    { mode: "list", label: "List", icon: LayoutList },
    { mode: "timeline", label: "Timeline", icon: Clock },
    { mode: "trends", label: "Trends", icon: BarChart2 },
  ] as const;

  return (
    <CardContainer
      title="Reading History"
      icon={CalendarDays}
      description="Track your reading journey and discover patterns"
      variant="subtle"
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

      <div className="flex items-center mt-4 md:mt-6">
        <span className="text-xs md:text-sm text-muted-foreground mr-2">
          View:
        </span>
        <div className="bg-secondary/20 rounded-lg p-1 flex flex-grow md:flex-grow-0">
          {viewModeOptions.map(({ mode, label, icon: Icon }) => (
            <Button
              key={mode}
              size="sm"
              variant={viewMode === mode ? "default" : "ghost"}
              className={`h-8 text-xs md:text-sm flex-1 md:flex-initial ${
                viewMode !== mode
                  ? "text-muted-foreground hover:text-foreground"
                  : ""
              }`}
              onClick={() => setViewMode(mode)}
            >
              <Icon className="mr-1 h-3 w-3 md:h-4 md:w-4" />
              <span className="md:inline">{label}</span>
            </Button>
          ))}
        </div>
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
        <span className="text-lg md:text-xl font-bold">{value}</span>
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
