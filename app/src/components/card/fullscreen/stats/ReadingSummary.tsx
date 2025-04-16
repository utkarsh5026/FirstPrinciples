import { formatNumber } from "@/components/analytics/utils";
import { Card } from "@/components/ui/card";
import { BookMarked } from "lucide-react";

interface ReadingSummaryProps {
  documentPath: string;
  category: string;
  totalWords: number;
  avgWordsPerSection: number;
  documentProgress: number;
  readingSpeed: number;
}

const ReadingSummary: React.FC<ReadingSummaryProps> = ({
  documentPath,
  category,
  totalWords,
  avgWordsPerSection,
  documentProgress,
  readingSpeed,
}) => {
  const getReadingStatus = (progress: number) => {
    if (progress === 100) return "Completed";
    if (progress > 0) return "In Progress";
    return "Not Started";
  };

  const getStatusColor = (progress: number) => {
    if (progress === 100) return "text-green-500";
    if (progress > 0) return "text-amber-500";
    return "text-gray-500";
  };

  return (
    <div className="mt-8 font-cascadia-code">
      <h3 className="text-sm font-medium mb-3 flex items-center">
        <BookMarked className="h-4 w-4 text-primary mr-2" />
        Reading Summary
      </h3>

      <Card className="bg-secondary/5 border-border/20 overflow-hidden">
        <div className="relative">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-700 w-full">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${documentProgress}%` }}
            />
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-muted-foreground">Document Path</div>
              <div className="text-right truncate font-medium">
                {documentPath}
              </div>

              <div className="text-muted-foreground">Category</div>
              <div className="text-right capitalize font-medium">
                {category}
              </div>

              <div className="text-muted-foreground">Total Words</div>
              <div className="text-right font-medium">
                {formatNumber(totalWords)}
              </div>

              <div className="text-muted-foreground">Average Section</div>
              <div className="text-right font-medium">
                {formatNumber(avgWordsPerSection)} words
              </div>

              <div className="text-muted-foreground">Reading Speed</div>
              <div className="text-right font-medium">{readingSpeed} WPM</div>

              <div className="text-muted-foreground">Reading Status</div>
              <div
                className={`text-right font-medium flex items-center justify-end ${getStatusColor(
                  documentProgress
                )}`}
              >
                <span
                  className="h-2 w-2 rounded-full mr-1.5 inline-block"
                  style={{ backgroundColor: "currentColor" }}
                ></span>
                {getReadingStatus(documentProgress)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReadingSummary;
