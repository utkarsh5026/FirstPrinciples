import { useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import useMobile from "@/hooks/device/use-mobile";
import DocumentStructurePanel from "./document-structure-panel";

interface DetailPanelProps {
  totalSections: number;
  wordCount: number;
  estimatedReadTime: number;
  readSections: Set<number>;
  loading: boolean;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  totalSections,
  wordCount,
  estimatedReadTime,
  readSections,
  loading,
}) => {
  const { isMobile } = useMobile();

  const completionPercentage = useMemo(() => {
    return totalSections > 0 ? (readSections.size / totalSections) * 100 : 0;
  }, [readSections, totalSections]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "bg-primary";
    if (percentage >= 50) return "bg-primary/80";
    if (percentage >= 25) return "bg-primary/60";
    return "bg-primary/40";
  };

  return (
    <>
      <DocumentStructurePanel
        totalSections={totalSections}
        wordCount={wordCount}
        estimatedReadTime={estimatedReadTime}
      />

      <div className="bg-secondary/5 p-4 border border-border/30 shadow-sm rounded-2xl">
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
                  transition={{
                    duration: isMobile ? 0.3 : 0.5,
                    ease: "easeOut",
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DetailPanel;
