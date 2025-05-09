import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/document-reading/preview/LoadingScreen";
import ErrorLoadingDocument from "@/components/document-reading/preview/ErrorLoadingDocument";
import FullScreenCardView from "@/components/document-reading/fullscreen/FullScreenCardView";
import NoFileSelectedYet from "@/components/document-reading/preview/NoFileSelectedYet";
import DetailPanel from "@/components/document-reading/preview/DetailPanel";
import getIconForTech from "@/components/shared/icons";
import Header from "@/components/document-reading/preview/Header";
import StartReadingButton from "@/components/document-reading/preview/StartReadingButton";
import ReadingSessionDialog from "@/components/document-reading/preview/ReadingSessionDialog";
import { formatTimeInMs } from "@/utils/time";
import { estimateWordsRead } from "@/services/analytics/word-count-estimation";
import { useDocument, useReadingHistory, useDocumentReading } from "@/hooks";
import { useParams } from "react-router-dom";

/**
 * 📄✨ DocumentPreview
 *
 * A beautiful document preview component that displays information about the selected document
 * in an elegant card format with sophisticated animations and visual effects.
 */
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
 */
const DocumentPreview: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastReadingTime, setLastReadingTime] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionTimeSpent, setSessionTimeSpent] = useState(0);
  const [sessionWordsRead, setSessionWordsRead] = useState(0);
  const readingStartTimeRef = useRef<number | null>(null);

  const { documentPath = "" } = useParams<{ documentPath: string }>();

  const { loading, error, metrics, category, documentTitle, markdown } =
    useDocument(documentPath);

  const { addToHistory, getDocumentHistory, updateReadingTime } =
    useReadingHistory();

  const {
    startSectionReading,
    endReading,
    getSection,
    readSections,
    sections,
    newSectionRead,
    alreadyReadSections,
  } = useDocumentReading();

  /**
   * ⏱️ Load previous reading time from history
   */
  useEffect(() => {
    if (!documentPath) return;

    const loadPreviousReadingTime = async () => {
      try {
        const docHistory = await getDocumentHistory(documentPath);
        if (docHistory && docHistory.timeSpent > 0) {
          setLastReadingTime(docHistory.timeSpent);
        }
      } catch (error) {
        console.error("Failed to load previous reading time:", error);
      }
    };

    loadPreviousReadingTime();
  }, [documentPath, getDocumentHistory]);

  /**
   * 🚀 Start tracking reading time when entering fullscreen
   */
  useEffect(() => {
    if (isFullscreen && !readingStartTimeRef.current) {
      readingStartTimeRef.current = Date.now();

      console.log("📚 Reading session started:", {
        document: documentTitle,
        path: documentPath,
        startTime: new Date().toLocaleTimeString(),
      });
    }
  }, [isFullscreen, documentPath, documentTitle, readSections]);

  /**
   * 🏁 Handle end of reading session
   */
  const handleReadingSessionEnd = useCallback((timeSpent: number) => {
    setLastReadingTime((prev) => (prev ?? 0) + timeSpent);
    console.log(`Reading session ended: ${formatTimeInMs(timeSpent)}`);
  }, []);

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
    if (readingStartTimeRef.current) {
      const timeSpent = Date.now() - readingStartTimeRef.current;
      const wordsRead = estimateWordsRead(timeSpent);

      setSessionTimeSpent(timeSpent);
      setSessionWordsRead(wordsRead);

      await updateReadingTime(documentPath, documentTitle, timeSpent);
      handleReadingSessionEnd(timeSpent);

      readingStartTimeRef.current = null;

      await endReading();
      setIsFullscreen(false);

      setTimeout(() => {
        setDialogOpen(true);
      }, 150);
    } else {
      await endReading();
      setIsFullscreen(false);
    }
  }, [
    documentPath,
    documentTitle,
    endReading,
    handleReadingSessionEnd,
    updateReadingTime,
  ]);

  if (isFullscreen) {
    return (
      <FullScreenCardView
        onExit={endReading}
        onChangeSection={startSectionReading}
        sections={sections}
        getSection={(index: number) => getSection(index) ?? null}
        readSections={readSections}
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
  const sectionCompletionPercent =
    (newSectionRead.size / sections.length) * 100 || 0;

  return (
    <AnimatePresence mode="wait">
      <div className="w-full mx-auto max-w-4xl mb-8 font-cascadia-code px-4 sm:px-6">
        <div className="bg-card/90 backdrop-blur-md rounded-3xl border border-border/30 overflow-hidden relative shadow-lg">
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
                    totalSections={sections.length}
                    wordCount={totalWords}
                    estimatedReadTime={parseInt(
                      formattedReadTime.split(":")[0]
                    )}
                    lastUpdatedFormatted={new Date().toLocaleDateString()}
                    readSections={readSections}
                    loading={loading}
                    lastReadingTime={
                      lastReadingTime
                        ? formatTimeInMs(lastReadingTime)
                        : "Not read yet"
                    }
                  />
                </div>
              </AnimatePresence>

              <StartReadingButton startReading={startReading} />
            </div>
          </div>
        </div>
      </div>

      <ReadingSessionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        documentTitle={documentTitle}
        category={category}
        timeSpent={sessionTimeSpent}
        estimatedWordsRead={sessionWordsRead}
        sectionsReadInSession={newSectionRead.size}
        totalSections={sections.length}
        sectionsCompletedPercent={sectionCompletionPercent}
        sectionsBeforeSession={alreadyReadSections.size}
      />
    </AnimatePresence>
  );
};

export default DocumentPreview;
