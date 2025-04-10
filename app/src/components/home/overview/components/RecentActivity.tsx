import React from "react";
import { Clock, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/context/ThemeContext";
import getIconForTech from "@/components/icons";
import { useTabContext } from "@/components/home/context/TabContext";
import { useReadingHistory } from "@/hooks";

interface RecentActivityProps {
  handleSelectDocument: (path: string, title: string) => void;
  formatDate: (timestamp: number) => string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  handleSelectDocument,
  formatDate,
}) => {
  const { readingHistory } = useReadingHistory();
  const { currentTheme } = useTheme();
  const { setActiveTab } = useTabContext();

  return (
    <Card className="p-4 border-primary/10 bg-gradient-to-r from-secondary/5 to-transparent hover:border-primary/30 transition-colors rounded-3xl">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2 text-primary/70" />
          Recent Activity
        </h4>
        <Badge
          variant="outline"
          className="text-xs"
          style={{
            borderColor: currentTheme.primary + "30",
            color: currentTheme.primary,
          }}
        >
          Latest
        </Badge>
      </div>

      {readingHistory.length > 0 ? (
        <div className="space-y-2">
          {readingHistory.slice(0, 3).map(({ path, title, lastReadAt }) => {
            const category = path.split("/")[0] || "uncategorized";
            const CategoryIcon = getIconForTech(category);
            return (
              <button
                key={path}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/5 transition-colors cursor-pointer group w-full"
                onClick={() => {
                  handleSelectDocument(path, title);
                }}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <CategoryIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate group-hover:text-primary transition-colors text-left">
                    {title}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1 inline-block" />
                    <span>{formatDate(lastReadAt)}</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No reading activity yet</p>
          <p className="text-xs mt-1">Your recent reads will appear here</p>
        </div>
      )}

      {readingHistory.length > 3 && (
        <div className="text-center mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary hover:bg-primary/10"
            onClick={() => {
              setActiveTab("history");
            }}
          >
            View all activity
          </Button>
        </div>
      )}
    </Card>
  );
};

export default RecentActivity;
