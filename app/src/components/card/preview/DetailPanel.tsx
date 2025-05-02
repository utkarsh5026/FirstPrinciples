import { useMemo } from "react";
import { useTheme } from "@/hooks/ui/use-theme";
import { motion } from "framer-motion";
import { LayoutList, Calendar, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import CardContainer from "@/components/container/CardContainer";
import { useDocumentReading } from "@/hooks";

interface DetailPanelProps {
  totalSections: number;
  wordCount: number;
  estimatedReadTime: number;
  lastUpdatedFormatted: string;
  selectedFile: string;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  totalSections,
  wordCount,
  estimatedReadTime,
  lastUpdatedFormatted,
  selectedFile,
}) => {
  const { readSections, sections, loading } = useDocumentReading();

  const completionPercentage = useMemo(() => {
    return totalSections > 0 ? (readSections.size / totalSections) * 100 : 0;
  }, [readSections, totalSections]);

  // Calculate remaining reading time
  const remainingReadingTime = Math.ceil(
    (estimatedReadTime * (100 - completionPercentage)) / 100
  );

  // Get progress color based on completion percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "bg-primary";
    if (percentage >= 50) return "bg-primary/80";
    if (percentage >= 25) return "bg-primary/60";
    return "bg-primary/40";
  };

  return (
    <>
      {/* Document Structure Panel */}
      <DocumentStructurePanel
        totalSections={totalSections}
        wordCount={wordCount}
        estimatedReadTime={estimatedReadTime}
        lastUpdatedFormatted={lastUpdatedFormatted}
      />

      {/* Reading Progress Panel (replacing file path) */}
      <div className="bg-secondary/5 rounded-xl p-4 border border-border/30 shadow-sm">
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <BookOpen className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
          Reading Progress
        </h3>

        {loading ? (
          <div className="flex justify-center py-3">
            <div className="animate-pulse h-4 w-24 bg-secondary rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>
                  {readSections.size} of {totalSections} sections
                </span>
                <span className="font-medium">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full",
                    getProgressColor(completionPercentage)
                  )}
                  initial={{ width: "0%" }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Remaining Time */}
            <div className="flex items-center justify-between">
              <div className="text-sm flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                Remaining Time
              </div>
              <div className="text-sm font-medium">
                {remainingReadingTime} min
              </div>
            </div>

            {/* Section Visualization - Mobile-friendly approach */}
            <div className="mt-3 pt-3 border-t border-border/30">
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: totalSections }).map((_, i) => {
                  const isRead = readSections.has(sections[i].id);
                  return (
                    <motion.div
                      key={sections[i].id}
                      className={cn(
                        "w-4 h-4 rounded-2xl",
                        isRead ? "bg-primary/80" : "bg-secondary/40"
                      )}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: i * 0.01,
                        duration: 0.2,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Hidden file path (only shown in debug mode) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground/60 break-all">
            {selectedFile}
          </div>
        )}
      </div>
    </>
  );
};

interface DocumentStructurePanelProps {
  totalSections: number;
  wordCount: number;
  estimatedReadTime: number;
  lastUpdatedFormatted: string;
}

const DocumentStructurePanel: React.FC<DocumentStructurePanelProps> = ({
  totalSections,
  wordCount,
  estimatedReadTime,
  lastUpdatedFormatted,
}) => {
  const { currentTheme } = useTheme();

  return (
    <CardContainer
      title="Document Structure"
      description="What can you expect in this document? 🙂"
      icon={LayoutList}
      variant="subtle"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">Sections</div>
        <div className="flex items-center">
          {/* Visual section indicator */}
          <div className="flex items-end h-6 mr-2">
            {Array.from({
              length: Math.min(totalSections, 10),
            }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-t-full mx-0.5"
                style={{
                  height: `${Math.max(8, 24 - i * 1.5)}px`,
                  backgroundColor:
                    i < 5
                      ? `${currentTheme.primary}${90 - i * 15}`
                      : `${currentTheme.primary}20`,
                }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(8, 24 - i * 1.5)}px` }}
                transition={{
                  delay: 0.1 + i * 0.05,
                  duration: 0.4,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{totalSections}</span>
        </div>
      </div>

      {/* Word count visualization */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">Word Count</div>
        <div className="text-sm font-medium">{wordCount.toLocaleString()}</div>
      </div>

      {/* Enhanced reading time breakdown */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">Estimated Reading Time</div>
        <div className="flex items-center">
          <div className="flex items-center">
            {Array.from({
              length: Math.min(estimatedReadTime, 5),
            }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full mx-0.5"
                style={{
                  backgroundColor: `${currentTheme.primary}${90 - i * 15}`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.2 + i * 0.1,
                  duration: 0.3,
                  ease: "backOut",
                }}
              />
            ))}
          </div>
          <span className="ml-2 text-sm font-medium">
            {estimatedReadTime} min
          </span>
        </div>
      </div>

      {/* Last updated with icon */}
      <div className="flex items-center justify-between">
        <div className="text-sm">Last Updated</div>
        <div className="text-sm flex items-center">
          <Calendar className="h-3 w-3 mr-1.5 text-muted-foreground" />
          {lastUpdatedFormatted}
        </div>
      </div>
    </CardContainer>
  );
};

export default DetailPanel;
