import React from "react";
import AnalyticsPage from "./AnalyticsPage";
import type { FileMetadata } from "@/utils/MarkdownLoader";
import { Button } from "@/components/ui/button";
import { BookOpen, Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useHistoryStore } from "@/stores";

interface AnalyticsViewProps {
  availableDocuments: FileMetadata[];
  onSelectDocument: (path: string, title: string) => void;
}

/**
 * AnalyticsView component provides a wrapper for the Analytics page
 * with loading states and helpful information for users
 */
const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  availableDocuments,
  onSelectDocument,
}) => {
  const [showInfo, setShowInfo] = React.useState(true);
  const readingHistory = useHistoryStore((state) => state.readingHistory);

  const hasActivity = readingHistory.length >= 2;

  return (
    <div className="space-y-6">
      {/* Info message that appears for first-time users */}
      {showInfo && (
        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-sm font-medium">
            Reading Analytics
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Track your reading progress, earn achievements, and level up your
            knowledge with this analytics dashboard. The more you read, the more
            detailed insights you'll see!
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-8 text-xs text-primary"
            onClick={() => setShowInfo(false)}
          >
            Got it
          </Button>
        </Alert>
      )}

      {hasActivity ? (
        // Main analytics content when there's data to show
        <AnalyticsPage onSelectDocument={onSelectDocument} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-primary/70" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            Start Reading to See Analytics
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            Your reading activity will generate insights and analytics once you
            start reading documents. Try reading a few to see your progress!
          </p>
          <Button
            className="bg-primary/10 text-primary hover:bg-primary/20"
            onClick={() => {
              // Find the first document to suggest
              if (availableDocuments.length > 0) {
                const firstDoc = availableDocuments[0];
                onSelectDocument(firstDoc.path, firstDoc.title);
              }
            }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Start Reading
          </Button>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
