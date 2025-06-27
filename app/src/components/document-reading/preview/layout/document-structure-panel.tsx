import { useTheme } from "@/hooks/ui/use-theme";
import { motion } from "framer-motion";
import { LayoutList } from "lucide-react";
import CardContainer from "@/components/shared/container/CardContainer";
import useMobile from "@/hooks/device/use-mobile";

interface DocumentStructurePanelProps {
  totalSections: number;
  wordCount: number;
  estimatedReadTime: number;
}

const DocumentStructurePanel: React.FC<DocumentStructurePanelProps> = ({
  totalSections,
  wordCount,
  estimatedReadTime,
}) => {
  const { currentTheme } = useTheme();
  const { isMobile } = useMobile();
  const maxVisualSections = isMobile ? 5 : 10;

  return (
    <CardContainer
      title="Document Structure"
      description={"What can you expect in this document? 🙂"}
      icon={LayoutList}
      variant="subtle"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">Sections</div>
        <div className="flex items-center">
          {!isMobile ? (
            <div className="flex items-end h-6 mr-2">
              {Array.from({
                length: Math.min(totalSections, maxVisualSections),
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
          ) : (
            <div className="flex items-end h-5 mr-2">
              {Array.from({
                length: Math.min(totalSections, maxVisualSections),
              }).map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-t-full mx-0.5"
                  style={{
                    height: `${Math.max(5, 15 - i)}px`,
                    backgroundColor:
                      i < 3
                        ? `${currentTheme.primary}${90 - i * 20}`
                        : `${currentTheme.primary}20`,
                  }}
                />
              ))}
            </div>
          )}
          <span className="text-sm font-medium">{totalSections}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">Word Count</div>
        <div className="text-sm font-medium">{`${wordCount.toLocaleString()} words`}</div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">Reading Time</div>
        <div className="flex items-center">
          {!isMobile ? (
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
          ) : (
            <div className="flex items-center">
              {Array.from({
                length: Math.min(estimatedReadTime, 3),
              }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full mx-0.5"
                  style={{
                    backgroundColor: `${currentTheme.primary}${90 - i * 20}`,
                  }}
                />
              ))}
            </div>
          )}
          <span className="ml-2 text-sm font-medium">
            {estimatedReadTime} min
          </span>
        </div>
      </div>
    </CardContainer>
  );
};

export default DocumentStructurePanel;
