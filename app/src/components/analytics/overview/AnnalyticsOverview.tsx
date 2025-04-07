import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Clock,
  ArrowUpRight,
  BookOpenCheck,
  LineChart,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import type {
  ReadingChallenge,
  ReadingStats,
} from "@/utils/ReadingAnalyticsService";
import { ReadingHistoryItem } from "@/components/home/types";
import ReadingProgress from "./ReadingProgress";
import DailyChallenges from "./DailyChallenges";
import CategoryBreakDown from "./CategoryBreakdown";

type Period = "week" | "month" | "all";

interface AnalyticsOverviewProps {
  stats: ReadingStats;
  isMobile: boolean;
  xpProgress: number;
  xpToNextLevel: number;
  currentLevelXP: number;
  thisWeekReadingCount: number;
  readingHistory: ReadingHistoryItem[];
  weeklyActivity: { name: string; count: number }[];
  monthlyReadingData: { name: string; count: number }[];
  categoryBreakdown: { name: string; value: number }[];
  readingByHour: { hour: number; count: number }[];
  recentActivity: ReadingHistoryItem[];
  challenges: ReadingChallenge[];
  actions: {
    refreshChallenges: () => void;
  };
  onSelectDocument: (path: string, title: string) => void;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  stats,
  isMobile,
  xpProgress,
  xpToNextLevel,
  currentLevelXP,
  thisWeekReadingCount,
  weeklyActivity,
  monthlyReadingData,
  categoryBreakdown,
  readingByHour,
  recentActivity,
  challenges,
  actions,
  readingHistory,
  onSelectDocument,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("week");
  return (
    <div className="space-y-6">
      {/* Progress Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Summary and stats */}
        <div className="space-y-4">
          <ReadingProgress
            stats={stats}
            currentLevelXP={currentLevelXP}
            xpToNextLevel={xpToNextLevel}
            xpProgress={xpProgress}
            thisWeekReadingCount={thisWeekReadingCount}
            readingHistory={readingHistory}
          />

          <DailyChallenges
            refreshChallenges={actions.refreshChallenges}
            challenges={challenges}
          />
        </div>

        {/* Right column: Activity overview */}
        <div className="space-y-4">
          {/* Recent Activity */}
          <Card className="p-4 border-primary/10 h-[365px] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-primary" />
                Recent Reads
              </h4>
              <Badge variant="outline" className="text-xs">
                Latest
              </Badge>
            </div>

            {recentActivity.length > 0 ? (
              <div className="overflow-auto flex-1 -mr-2 pr-2">
                <div className="space-y-2">
                  {recentActivity.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-md hover:bg-primary/5 transition-colors cursor-pointer border border-transparent hover:border-primary/10"
                      onClick={() => onSelectDocument(item.path, item.title)}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpenCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center justify-between mt-0.5">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 inline-block" />
                            <span>
                              {new Date(item.lastReadAt).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                          {item.readCount > 1 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4"
                            >
                              Read {item.readCount}×
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col">
                <BookOpen className="h-12 w-12 text-muted-foreground opacity-20 mb-3" />
                <p className="text-muted-foreground text-sm">
                  No reading activity yet
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Start reading documents to track your progress
                </p>
              </div>
            )}
          </Card>

          {/* Reading Trends - Bar Chart */}
          <Card className="p-4 border-primary/10">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium flex items-center">
                <LineChart className="h-4 w-4 mr-2 text-primary" />
                Reading Trends
              </h4>
              <div className="flex bg-secondary/20 rounded-lg p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2 text-xs rounded-md",
                    selectedPeriod === "week" && "bg-card"
                  )}
                  onClick={() => setSelectedPeriod("week")}
                >
                  Week
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2 text-xs rounded-md",
                    selectedPeriod === "month" && "bg-card"
                  )}
                  onClick={() => setSelectedPeriod("month")}
                >
                  Month
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2 text-xs rounded-md",
                    selectedPeriod === "all" && "bg-card"
                  )}
                  onClick={() => setSelectedPeriod("all")}
                >
                  All
                </Button>
              </div>
            </div>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    selectedPeriod === "week"
                      ? weeklyActivity
                      : monthlyReadingData
                  }
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#333"
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => [
                      `${value} documents`,
                      "Read",
                    ]}
                    labelStyle={{ color: "#888" }}
                    contentStyle={{
                      backgroundColor: "rgba(22, 22, 22, 0.9)",
                      border: "1px solid #333",
                      borderRadius: "4px",
                      color: "#fff",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                    name="Documents Read"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Category Breakdown and Time of Day */}
      <CategoryBreakDown
        categoryBreakdown={categoryBreakdown}
        isMobile={isMobile}
        readingByHour={readingByHour}
      />
    </div>
  );
};

export default AnalyticsOverview;
