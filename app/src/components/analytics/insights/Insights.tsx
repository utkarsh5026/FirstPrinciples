import React from "react";
import { Card } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";

import type { ReadingStats } from "@/utils/ReadingAnalyticsService";
import type { AnalyticsData } from "../types";
import type { ReadingHistoryItem } from "@/hooks/useDocumentManager";
import CategoryInsights from "./CategoryInsights";
import ProgressOverTime from "./ProgressOverTime";
import WeekilyPattern from "./WeeklyPattern";
import TimeOfDay from "./TimeOfDay";

interface InsightsProps {
  stats: ReadingStats;
  analyticsData: AnalyticsData;
  readingHistory: ReadingHistoryItem[];
  monthlyReadingData: { name: string; count: number }[];
}

const Insights: React.FC<InsightsProps> = ({
  stats,
  analyticsData,
  readingHistory,
  monthlyReadingData,
}) => {
  const { weeklyActivity, readingByHour, categoryBreakdown } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Reading Habits */}
      <Card className="p-4 border-primary/10 rounded-2xl">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium flex items-center">
            <PieChartIcon className="h-4 w-4 mr-2 text-primary" />
            Reading Habits
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Pattern */}
          <WeekilyPattern weeklyActivity={weeklyActivity} />

          {/* Time of Day Pattern */}
          <TimeOfDay readingByHour={readingByHour} />
        </div>

        {/* Reading Progress Over Time */}
        <ProgressOverTime monthlyReadingData={monthlyReadingData} />
      </Card>

      {/* Category Insights */}
      <CategoryInsights
        readingHistory={readingHistory}
        stats={stats}
        categoryBreakdown={categoryBreakdown}
      />
    </div>
  );
};

export default Insights;
