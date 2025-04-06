import { RotateCcw, Share2, Download, AlertCircle, Folder } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatReadingTime, formatNumber } from "../utils";
import type {
  ReadingAchievement,
  ReadingChallenge,
  ReadingStats,
} from "@/utils/ReadingAnalyticsService";
import type { AnalyticsData } from "../types";
import type { FileMetadata } from "@/utils/MarkdownLoader";
import type {
  ReadingHistoryItem,
  ReadingTodoItem,
} from "@/components/home/types";
import { useState } from "react";

interface InsightsProps {
  stats: ReadingStats;
  analyticsData: AnalyticsData;
  availableDocuments: FileMetadata[];
  todoList: ReadingTodoItem[];
  achievements: ReadingAchievement[];
  challenges: ReadingChallenge[];
  readingHistory: ReadingHistoryItem[];
  onResetProgress: () => void;
  onRefreshChallenges: () => void;
}

const Insights: React.FC<InsightsProps> = ({
  stats,
  analyticsData,
  availableDocuments,
  todoList,
  achievements,
  challenges,
  readingHistory,
  onResetProgress,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Reading Pace */}
      <Card className="p-4 border-primary/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Reading Pace</h3>
          <Badge variant="outline" className="text-xs">
            Estimate
          </Badge>
        </div>

        <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/10 text-center">
          <div className="text-3xl font-bold mb-1">300</div>
          <p className="text-xs text-muted-foreground mb-4">Words per minute</p>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xl font-bold">
                {formatReadingTime(stats.totalReadingTime)}
              </div>
              <p className="text-xs text-muted-foreground">Total Time</p>
            </div>
            <div>
              <div className="text-xl font-bold">
                {formatNumber(stats.estimatedWordsRead)}
              </div>
              <p className="text-xs text-muted-foreground">Words Read</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs text-muted-foreground mb-1">
            Reading Performance
          </div>
          <div className="flex items-center gap-2">
            <Progress value={80} className="h-2 flex-grow" />
            <span className="text-xs font-medium">Good</span>
          </div>
        </div>
      </Card>

      {/* Category Focus */}
      <Card className="p-4 border-primary/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Category Focus</h3>
          <Badge variant="outline" className="text-xs">
            Top Categories
          </Badge>
        </div>

        {analyticsData.categoryBreakdown.length > 0 ? (
          <div className="space-y-3">
            {analyticsData.categoryBreakdown
              .slice(0, 3) // Show top 3 categories
              .map((category, index) => {
                const total = analyticsData.categoryBreakdown.reduce(
                  (sum, cat) => sum + cat.value,
                  0
                );
                const percentage = Math.round((category.value / total) * 100);

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{category.name}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {category.value}{" "}
                      {category.value === 1 ? "document" : "documents"}
                    </p>
                  </div>
                );
              })}

            {analyticsData.categoryBreakdown.length > 3 && (
              <div className="text-xs text-center text-muted-foreground mt-2">
                And {analyticsData.categoryBreakdown.length - 3} more categories
              </div>
            )}
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-center text-muted-foreground text-sm">
            <div>
              <Folder className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No category data available</p>
              <p className="text-xs mt-1">
                Read from different categories to see insights
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Reading Progress */}
      <Card className="p-4 border-primary/10 md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Reading Progress</h3>
          <Badge variant="outline" className="text-xs">
            {stats.documentsCompleted}/{availableDocuments.length} Documents
          </Badge>
        </div>

        <div className="space-y-1 mb-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{stats.percentComplete}%</span>
          </div>
          <Progress value={stats.percentComplete} className="h-2.5" />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/10 text-center">
            <div className="text-lg font-bold">{stats.documentsCompleted}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>

          <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/10 text-center">
            <div className="text-lg font-bold">
              {todoList.filter((item) => !item.completed).length}
            </div>
            <p className="text-xs text-muted-foreground">Planned</p>
          </div>

          <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/10 text-center">
            <div className="text-lg font-bold">
              {availableDocuments.length -
                stats.documentsCompleted -
                todoList.filter((item) => !item.completed).length}
            </div>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs text-muted-foreground mb-2">
            Recommendation
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm">
              {stats.percentComplete < 25
                ? "You're just getting started! Try to read from different categories to build a strong foundation."
                : stats.percentComplete < 50
                ? "You're making good progress! Consider setting a daily reading goal to maintain your momentum."
                : stats.percentComplete < 75
                ? "You're well on your way to becoming an expert! Focus on maintaining your reading streak for best results."
                : "Impressive progress! You've completed most of the content. Consider revisiting key documents to reinforce your knowledge."}
            </p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-4 border-primary/10 md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Data Management</h3>
          <Badge variant="outline" className="text-xs">
            Advanced
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // Download reading stats as JSON
              const data = {
                stats,
                achievements,
                challenges,
                readingHistory,
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "reading-analytics.json";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export Data
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // Simulate sharing functionality
              alert(
                "Sharing functionality would be implemented here.\n\nThis would allow users to share their reading achievements on social media."
              );
            }}
          >
            <Share2 className="h-4 w-4 mr-1.5" />
            Share Stats
          </Button>

          <Button
            variant={showConfirmReset ? "destructive" : "outline"}
            className="w-full"
            onClick={() => {
              if (showConfirmReset) {
                onResetProgress();
                setShowConfirmReset(false);
              } else {
                setShowConfirmReset(true);
              }
            }}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            {showConfirmReset ? "Confirm Reset" : "Reset Progress"}
          </Button>
        </div>

        {showConfirmReset && (
          <div className="mt-4 p-3 rounded-lg border border-destructive/30 bg-destructive/10">
            <p className="text-sm text-destructive">
              <AlertCircle className="h-4 w-4 inline-block mr-1.5" />
              Warning: This will permanently delete all your reading progress,
              achievements, and stats. This action cannot be undone.
            </p>
            <div className="flex justify-end mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs mr-2"
                onClick={() => setShowConfirmReset(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Insights;
