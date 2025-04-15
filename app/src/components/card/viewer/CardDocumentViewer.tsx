import React, { useState, useRef } from "react";
import LoadingScreen from "@/components/core/LoadingScreen";
import MarkdownCardView from "@/components/card/MarkdownCardView";
import FullScreenCardView from "@/components/card/fullscreen/FullScreenCardView";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { cn } from "@/lib/utils";
import Header from "./Header";
import AchievementDialog from "./AchievmentDialog";
import NoFileSelectedYet from "./NoFileSelectedYet";
import ErrorLoadingDocument from "./ErrorLoadingDocument";

import { useDocumentLoader } from "@/hooks/loading/useDocumentLoader";
import useMobile from "@/hooks/useMobile";

interface CardDocumentViewerProps {
  selectedFile: string;
}

/**
 * Enhanced CardDocumentViewer component displays markdown documents in a card-based view.
 * It handles loading, displaying, and navigating through markdown content,
 * with support for fullscreen mode, downloading, and sharing.
 *
 * This modernized version includes improved aesthetics, animations, and mobile optimizations.
 *
 * @param {Object} props - Component props
 * @param {string} props.selectedFile - Path to the currently selected markdown file
 * @returns {React.ReactElement} The rendered component
 */
const CardDocumentViewer: React.FC<CardDocumentViewerProps> = ({
  selectedFile,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const { isMobile } = useMobile();
  const { currentTheme } = useTheme();
  const {
    markdownContent,
    loading,
    error,
    documentTitle,
    estimatedReadTime,
    parsedSections,
    showAchievementPopup,
    achievementToShow,
    closeAchievementPopup,
  } = useDocumentLoader(selectedFile);

  /**
   * 🌟 This function toggles between fullscreen and normal viewing modes,
   * allowing users to enjoy their documents in a more immersive way!
   */
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen)
    return (
      <FullScreenCardView
        markdown={markdownContent}
        onExit={() => setIsFullscreen(false)}
        parsedSections={parsedSections}
        documentPath={selectedFile}
      />
    );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorLoadingDocument error={error} />;
  if (!selectedFile) return <NoFileSelectedYet />;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="w-full mx-auto max-w-4xl h-full flex flex-col"
      >
        <Header
          documentTitle={documentTitle}
          markdownContent={markdownContent}
          estimatedReadTime={estimatedReadTime}
          selectedFile={selectedFile}
          toggleFullscreen={toggleFullscreen}
        />

        {/* Main content area */}
        <motion.div
          className="flex-1 flex flex-col"
          ref={contentRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="bg-card/70 backdrop-blur-[2px] rounded-4xl border border-border/30 shadow-sm h-full flex flex-col relative overflow-hidden"
            ref={cardContainerRef}
          >
            {/* Decorative glows */}
            <div
              className="absolute pointer-events-none -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: currentTheme.primary }}
            />
            <div
              className="absolute pointer-events-none -bottom-20 -left-20 w-40 h-40 rounded-full opacity-10 blur-3xl"
              style={{ backgroundColor: currentTheme.primary }}
            />

            {/* Card content and Table of Contents */}
            <div className="flex-1 flex overflow-hidden relative">
              <div
                className={cn(
                  "flex-1 overflow-hidden",
                  !isMobile ? "md:w-[calc(100%-16rem)]" : "w-full"
                )}
              >
                <div className="p-2 sm:p-6 h-full border-2 rounded-4xl">
                  <MarkdownCardView
                    markdown={markdownContent}
                    parsedSections={parsedSections}
                    className="h-full rounded-4xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {achievementToShow && (
          <AchievementDialog
            showAchievementPopup={showAchievementPopup}
            closeAchievementPopup={closeAchievementPopup}
            levelUp={achievementToShow.isLevelUp}
            achievementTitle={achievementToShow.title}
            achievementDescription={achievementToShow.description}
            xpGained={achievementToShow.xpGained}
            newLevel={achievementToShow.newLevel}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CardDocumentViewer;
