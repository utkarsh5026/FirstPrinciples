import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FullScreenCardView from "@/components/document-reading/fullscreen/FullScreenCardView";
import getIconForTech from "@/components/shared/icons";
import { DetailPanel, Header, StartReadingButton } from "./layout";
import {
  LoadingScreen,
  ErrorLoadingDocument,
  NoFileSelectedYet,
  ReadingSessionDialog,
} from "./utils";
import { formatTimeInMs } from "@/utils/time";
import { estimateWordsRead } from "@/services/analytics/word-count-estimation";
import {
  useDocument,
  useReadingHistory,
  useDocumentNavigation,
  useMobile,
} from "@/hooks";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * 🧭 NavigationButton
 *
 * Reusable navigation button component for previous/next document navigation
 */
interface NavigationButtonProps {
  direction: "previous" | "next";
  onClick: () => void;
  document?: { title: string } | null;
  canNavigate: boolean;
  isMobile: boolean;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  direction,
  onClick,
  document,
  canNavigate,
  isMobile,
}) => {
  if (!canNavigate || isMobile) return null;

  const isPrevious = direction === "previous";
  const Icon = isPrevious ? ChevronLeft : ChevronRight;
  const label = isPrevious ? "Previous" : "Next";
  const defaultTitle = isPrevious ? "Previous Document" : "Next Document";

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.button
        onClick={onClick}
        className={cn(
          "z-20 group cursor-pointer",
          // Mobile: circular button
          "w-12 h-12 rounded-full md:rounded-2xl",
          // Desktop: expanded button with text
          "md:w-auto md:h-auto md:px-4 md:py-3",
          isPrevious ? "md:-translate-x-4" : "md:translate-x-4",
          "border border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card",
          "transition-all duration-300 hover:border-primary/30 hover:shadow-lg",
          "flex items-center justify-center gap-2",
          isPrevious ? "md:justify-start" : "md:justify-end",
          "hover:scale-110 active:scale-95 md:hover:scale-105"
        )}
        initial={{ opacity: 0, x: isPrevious ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPrevious && (
          <Icon className="h-5 w-5 text-primary group-hover:text-primary/80 flex-shrink-0" />
        )}
        <div
          className={cn(
            "hidden md:block min-w-0",
            isPrevious ? "text-left" : "text-right"
          )}
        >
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium text-foreground truncate max-w-[160px]">
            {document?.title ?? defaultTitle}
          </p>
        </div>
        {!isPrevious && (
          <Icon className="h-5 w-5 text-primary group-hover:text-primary/80 flex-shrink-0" />
        )}
      </motion.button>
    </div>
  );
};

/**
 * 📄✨ DocumentPreview
 *
 * A beautiful document preview component that displays information about the selected document
 * in an elegant card format with sophisticated animations and visual effects.
 *
 * 🧠 Manages reading sessions, tracks progress, and provides a seamless reading experience
 * 📊 Shows document metrics like word count, reading time, and completion status
 * 🔄 Handles transitions between preview and fullscreen reading modes
 * 📝 Saves reading progress and session data for future visits
 * 👆 Supports swipe gestures for navigation between documents
 */
const DocumentPreview: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionData, setSessionData] = useState<{
    totalWords: number;
    totalTime: number;
  }>({
    totalWords: 0,
    totalTime: 0,
  });
  const readingStartTimeRef = useRef<number | null>(null);
  const { isMobile } = useMobile();

  const { documentPath = "" } = useParams<{ documentPath: string }>();

  // Document navigation hook
  const {
    navigateToPrevious,
    navigateToNext,
    canNavigatePrevious,
    canNavigateNext,
    previousDocument,
    nextDocument,
  } = useDocumentNavigation(documentPath);

  const {
    loading,
    error,
    metrics,
    category,
    documentTitle,
    markdown,
    sectionData,
    getSection,
    markSectionAsCompleted,
    saveCompletedSections,
    resetSessionStatus,
  } = useDocument(documentPath);

  const { addToHistory, updateReadingTime } = useReadingHistory();

  /**
   * 👆 React-swipeable handlers for document navigation
   */
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      // Swipe left = next document
      if (canNavigateNext && !isFullscreen) {
        navigateToNext();
      }
    },
    onSwipedRight: () => {
      // Swipe right = previous document
      if (canNavigatePrevious && !isFullscreen) {
        navigateToPrevious();
      }
    },
    trackMouse: true,
    delta: 100,
    preventScrollOnSwipe: false,
    trackTouch: true,
  });

  /**
   * 🚀 Start tracking reading time when entering fullscreen
   */
  useEffect(() => {
    if (isFullscreen && !readingStartTimeRef.current) {
      readingStartTimeRef.current = Date.now();
    }
  }, [isFullscreen]);

  /**
   * 📖 Begin reading session in fullscreen
   */
  const startReading = useCallback(() => {
    addToHistory(documentPath, documentTitle).then(() => {
      console.log("Starting reading session:", documentPath, documentTitle);
      setIsFullscreen(true);
    });
  }, [addToHistory, documentPath, documentTitle]);

  /**
   * 🔍 Exit fullscreen and show session summary
   */
  const handleExitFullscreen = useCallback(async () => {
    if (!readingStartTimeRef.current) {
      await saveCompletedSections();
      setIsFullscreen(false);
      return;
    }

    const timeSpent = Date.now() - readingStartTimeRef.current;
    const wordsRead = estimateWordsRead(timeSpent);

    setSessionData({
      totalWords: wordsRead,
      totalTime: timeSpent,
    });

    await updateReadingTime(documentPath, documentTitle, timeSpent);

    readingStartTimeRef.current = null;

    await saveCompletedSections();
    setIsFullscreen(false);

    setTimeout(() => {
      setDialogOpen(true);
    }, 150);
  }, [documentPath, documentTitle, updateReadingTime, saveCompletedSections]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetSessionStatus();
  };

  if (isFullscreen) {
    return (
      <FullScreenCardView
        onExit={saveCompletedSections}
        onChangeSection={markSectionAsCompleted}
        sections={sectionData.sectionsContent}
        getSection={(index: number) => getSection(index) ?? null}
        readSections={sectionData.completedSectionIds}
        exitFullScreen={handleExitFullscreen}
        markdown={markdown}
      />
    );
  }

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorLoadingDocument error={error} />;
  if (!documentPath) return <NoFileSelectedYet />;

  const { totalWords, totalTime, totalSections } = metrics;
  const formattedReadTime = formatTimeInMs(totalTime);

  const CategoryIcon = getIconForTech(category);

  return (
    <AnimatePresence mode="wait">
      <div
        {...swipeHandlers}
        className="w-full mx-auto max-w-6xl mb-8 font-cascadia-code px-4 sm:px-6 relative flex flex-row items-center justify-center"
      >
        {/* Navigation Buttons - Now DRY! */}
        <NavigationButton
          direction="previous"
          onClick={navigateToPrevious}
          document={previousDocument}
          canNavigate={canNavigatePrevious}
          isMobile={isMobile}
        />

        <div className="flex flex-col items-center justify-center w-full flex-1">
          {(canNavigatePrevious || canNavigateNext) && isMobile && (
            <motion.div
              className="text-center mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/20 border border-border/10">
                <motion.div
                  animate={{ x: [-1, 1, -1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  👆
                </motion.div>
                <span className="text-xs text-muted-foreground">
                  Swipe to navigate
                </span>
              </div>
            </motion.div>
          )}
          <div className="bg-card/90 backdrop-blur-md rounded-3xl border border-border/30 overflow-hidden relative shadow-lg w-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-80" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-70" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-70" />

            <div className="relative z-10">
              <Header
                categoryIcon={
                  <CategoryIcon className="h-5 w-5 mr-1.5 text-primary/90" />
                }
                category={category}
                estimatedReadTime={formattedReadTime}
                totalSections={totalSections}
                documentTitle={documentTitle}
              />

              {/* Main content area */}
              <div className="px-6 sm:px-8 pb-8">
                <AnimatePresence mode="wait">
                  <div className="space-y-6 min-h-[200px]">
                    <DetailPanel
                      totalSections={sectionData.sectionsContent.length}
                      wordCount={totalWords}
                      estimatedReadTime={parseInt(
                        formattedReadTime.split(":")[0]
                      )}
                      readSections={sectionData.completedSectionIds}
                      loading={loading}
                    />
                  </div>
                </AnimatePresence>

                <StartReadingButton startReading={startReading} />
              </div>
            </div>
          </div>
        </div>

        <NavigationButton
          direction="next"
          onClick={navigateToNext}
          document={nextDocument}
          canNavigate={canNavigateNext}
          isMobile={isMobile}
        />
      </div>

      <ReadingSessionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        timeSpent={sessionData.totalTime}
        sectionData={{
          total: sectionData.sectionsContent.length,
          previouslyRead: sectionData.previouslyCompletedSections.size,
          newlyRead: sectionData.newlyCompletedSections.size,
          completed: sectionData.completedSectionIds.size,
        }}
      />
    </AnimatePresence>
  );
};

export default DocumentPreview;
