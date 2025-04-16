import { motion } from "framer-motion";
import { BarChart2, BookOpen, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatsProps {
  readingStats: any;
}

const formatReadingTime = (milliseconds: number): string => {
  if (milliseconds < 60000) {
    return `${Math.floor(milliseconds / 1000)}s`;
  } else if (milliseconds < 3600000) {
    return `${Math.floor(milliseconds / 60000)}m ${Math.floor(
      (milliseconds % 60000) / 1000
    )}s`;
  } else {
    return `${Math.floor(milliseconds / 3600000)}h ${Math.floor(
      (milliseconds % 3600000) / 60000
    )}m`;
  }
};

const Stats: React.FC<StatsProps> = ({ readingStats }) => {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25 }}
      className="absolute inset-0 bg-card z-10 overflow-y-auto"
    >
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm">
        <h2 className="text-base font-medium flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          Reading Analytics
        </h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleStats}
          className="h-8 w-8"
          aria-label="Close stats"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4">
        {readingStats ? (
          <div className="space-y-6">
            {/* Overall Reading Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-xs text-muted-foreground">Total Time</div>
                <div className="text-lg font-medium">
                  {formatReadingTime(readingStats.totalTime)}
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-xs text-muted-foreground">Words Read</div>
                <div className="text-lg font-medium">
                  {readingStats.totalWords > 1000
                    ? `${(readingStats.totalWords / 1000).toFixed(1)}k`
                    : readingStats.totalWords}
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">
                  Reading Speed
                </div>
                <div className="text-lg font-medium">
                  {readingStats.readingSpeed} WPM
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">
                  Current Category
                </div>
                <div className="text-lg font-medium capitalize">{category}</div>
              </div>
            </div>

            {/* Daily Reading Chart */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">
                Daily Reading Activity
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={readingStats.dailyData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 12,
                        fill: "var(--muted-foreground)",
                      }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 12,
                        fill: "var(--muted-foreground)",
                      }}
                      tickFormatter={(value) => `${value}m`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [
                        `${value} min`,
                        "Reading Time",
                      ]}
                      labelFormatter={(value) => `${value}`}
                    />
                    <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                      {readingStats.dailyData.map(
                        (entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={"var(--primary)"}
                            fillOpacity={
                              index === readingStats.dailyData.length - 1
                                ? 0.8
                                : 0.4
                            }
                          />
                        )
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Current Document Stats */}
            <div className="mt-4 bg-card/70 p-4 rounded-lg border border-border/30">
              <h3 className="text-sm font-medium mb-2">Current Document</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completion:</span>
                  <span className="font-medium">{documentProgress}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sections Read:</span>
                  <span className="font-medium">
                    {readSections.size} of {sections.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Current Section:
                  </span>
                  <span className="font-medium">
                    {currentIndex + 1} of {sections.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Section Progress:
                  </span>
                  <span className="font-medium">{sectionProgress}%</span>
                </div>
              </div>
            </div>

            {/* Reading Tips */}
            <div className="text-xs text-muted-foreground space-y-2 mt-4">
              <p className="pl-2 border-l-2 border-primary/30">
                Your reading in this category accounts for{" "}
                {readingStats.categoryTime > 0
                  ? Math.round(
                      (readingStats.categoryTime / readingStats.totalTime) * 100
                    )
                  : 0}
                % of your total reading time.
              </p>

              {readingStats.readingSpeed > 0 && (
                <p className="pl-2 border-l-2 border-primary/30">
                  At your current reading speed of {readingStats.readingSpeed}{" "}
                  WPM, you could read a novel ({80000} words) in about{" "}
                  {Math.round(80000 / readingStats.readingSpeed / 60)} hours.
                </p>
              )}

              {readingStats.dailyData.some((day: any) => day.minutes > 0) && (
                <p className="pl-2 border-l-2 border-primary/30">
                  Your most active reading day is{" "}
                  {
                    readingStats.dailyData.sort(
                      (a: any, b: any) => b.minutes - a.minutes
                    )[0].day
                  }
                  .
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-center">
              <div className="h-8 w-8 rounded-full bg-primary/20 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading reading stats...</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Stats;
