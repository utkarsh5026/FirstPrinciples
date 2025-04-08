import React from "react";
import { LayoutList, Clock, BarChart2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
 * 🎉 HistoryHeader Component
 *
 * This component serves as the delightful header for the history section,
 * showcasing important time statistics in a visually appealing way!
 * It allows users to quickly glance at their performance over different
 * time frames, such as today, this week, this month, and total. 📊
 *
 * Users can easily switch between different viewing modes (list, timeline, trends)
 * to find the presentation style that suits them best. 🌈
 */
const HistoryHeader: React.FC<HistoryHeaderProps> = ({
  timeStats,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Today" value={timeStats.today} />
        <StatCard label="This Week" value={timeStats.thisWeek} />
        <StatCard label="This Month" value={timeStats.thisMonth} />
        <StatCard label="Total" value={timeStats.total} highlight />
      </div>

      <div className="flex items-center mt-2 md:mt-0">
        <span className="text-xs md:text-sm text-muted-foreground mr-1">
          View:
        </span>
        <div className="bg-secondary/20 rounded-lg p-1 flex flex-grow md:flex-grow-0">
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            className={`h-8 text-xs md:text-sm flex-1 md:flex-initial ${
              viewMode !== "list"
                ? "text-muted-foreground hover:text-foreground"
                : ""
            }`}
            onClick={() => setViewMode("list")}
          >
            <LayoutList className="mr-1 h-3 w-3 md:h-4 md:w-4" />
            <span className="md:inline">List</span>
          </Button>
          <Button
            size="sm"
            variant={viewMode === "timeline" ? "default" : "ghost"}
            className={`h-8 text-xs md:text-sm flex-1 md:flex-initial ${
              viewMode !== "timeline"
                ? "text-muted-foreground hover:text-foreground"
                : ""
            }`}
            onClick={() => setViewMode("timeline")}
          >
            <Clock className="mr-1 h-3 w-3 md:h-4 md:w-4" />
            <span className="md:inline">Timeline</span>
          </Button>
          <Button
            size="sm"
            variant={viewMode === "trends" ? "default" : "ghost"}
            className={`h-8 text-xs md:text-sm flex-1 md:flex-initial ${
              viewMode !== "trends"
                ? "text-muted-foreground hover:text-foreground"
                : ""
            }`}
            onClick={() => setViewMode("trends")}
          >
            <BarChart2 className="mr-1 h-3 w-3 md:h-4 md:w-4" />
            <span className="md:inline">Trends</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * 🌟 StatCard Component
 *
 * This delightful little card is designed to showcase important statistics
 * in a visually appealing way! It brings together a label and a value to create
 * a compact and informative display. Perfect for dashboards or any place where
 * you want to highlight key metrics! ✨
 *
 * With its smooth hover effects and rounded corners, it adds a touch of elegance
 * to your UI while keeping the information clear and accessible. Use this component
 * to make your data shine and keep your users engaged! 🎉
 */
const StatCard: React.FC<{
  label: string;
  value: number;
  highlight?: boolean;
}> = ({ label, value, highlight }) => {
  return (
    <Card
      className={`p-2 flex flex-col rounded-2xl items-center justify-center ${
        highlight ? "border-primary/20 bg-primary/5" : "border-secondary/30"
      }`}
    >
      <span className="text-lg md:text-xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </Card>
  );
};

export default HistoryHeader;
