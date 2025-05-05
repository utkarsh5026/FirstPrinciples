import React from "react";
import { Clock, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import getIconForTech from "@/components/shared/icons";
import { useTabContext } from "@/components/home/context/TabContext";
import { useHistoryStore } from "@/stores";
import { formatDate } from "@/components/home/utils";
import CardContainer from "@/components/container/CardContainer";

interface RecentActivityProps {
  handleSelectDocument: (path: string, title: string) => void;
}

/**
 * 🎉 RecentActivity Component
 *
 * This delightful component showcases the user's recent reading activities!
 * It brings a touch of joy by displaying the latest documents read,
 * complete with timestamps and cute icons! 🌟
 *
 * If there's no reading history, it gently reminds users that
 * their recent reads will appear here soon! 📚✨
 *
 * The component also allows users to navigate to their reading history
 * with a simple click, making it easy to revisit past documents!
 *
 * Enjoy exploring your reading journey! 😊
 */
const RecentActivity: React.FC<RecentActivityProps> = ({
  handleSelectDocument,
}) => {
  const readingHistory = useHistoryStore((state) => state.readingHistory);
  const { setActiveTab } = useTabContext();

  return (
    <CardContainer
      title="Recent Activity"
      icon={Clock}
      description="Your recent reads will appear here"
      variant="subtle"
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2 text-primary/70" />
          Recent Activity
        </h4>
        <Badge
          variant="default"
          className="text-xs rounded-2xl text-amber-50 bg-primary/30"
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
    </CardContainer>
  );
};

export default RecentActivity;
