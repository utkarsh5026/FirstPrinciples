import { useTheme } from "@/components/theme/context/ThemeContext";
import { motion } from "framer-motion";
import { LayoutList, FileText, Calendar } from "lucide-react";

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
  const { currentTheme } = useTheme();

  return (
    <>
      <div className="bg-secondary/5 rounded-xl p-4 border border-border/30 shadow-sm">
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <LayoutList className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
          Document Structure
        </h3>

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
          <div className="text-sm font-medium">
            {wordCount.toLocaleString()}
          </div>
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
      </div>

      {/* Path indicator */}
      <div className="bg-secondary/5 rounded-xl p-4 border border-border/30 shadow-sm">
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <FileText className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
          File Information
        </h3>
        <div className="text-xs text-muted-foreground break-all">
          {selectedFile}
        </div>
      </div>
    </>
  );
};

export default DetailPanel;
