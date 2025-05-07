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
import {
  useCurrentDocument,
  useReadingHistory,
  useDocumentReading,
} from "@/hooks";
import { useParams } from "react-router-dom";

/**
 * 📄✨ DocumentPreview
 *
 * A beautiful document preview component that displays information about the selected document
 * in an elegant card format with sophisticated animations and visual effects.
 */
const DocumentPreview: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastReadingTime, setLastReadingTime] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionTimeSpent, setSessionTimeSpent] = useState(0);
  const [sessionWordsRead, setSessionWordsRead] = useState(0);

  const readingStartTimeRef = useRef<number | null>(null);
  const readSectionsBeforeRef = useRef<Set<string>>(new Set());
  const readSectionsAfterRef = useRef<Set<string>>(new Set());

  const { documentPath = "" } = useParams<{ documentPath: string }>();

  const {
    loadedDocumentForUrl,
    loading,
    error,
    metrics,
    category,
    documentTitle,
  } = useCurrentDocument();

  const { addToHistory, getDocumentHistory, updateReadingTime } =
    useReadingHistory();

  const {
    startSectionReading,
    endReading,
    getSection,
    readSections,
    sections,
  } = useDocumentReading();

  useEffect(() => {
    const fullPath = documentPath.endsWith(".md")
      ? documentPath
      : `${documentPath}.md`;
    loadedDocumentForUrl(fullPath);
  }, [documentPath, loadedDocumentForUrl]);

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

  // Start tracking reading time and sections when entering fullscreen
  useEffect(() => {
    if (isFullscreen && !readingStartTimeRef.current) {
      // Start the timer when entering fullscreen
      readingStartTimeRef.current = Date.now();

      // Store current read sections for comparison later
      readSectionsBeforeRef.current = new Set(readSections);

      console.log("📚 Reading session started:", {
        document: documentTitle,
        path: documentPath,
        startTime: new Date().toLocaleTimeString(),
        sectionsBeforeSession: readSectionsBeforeRef.current.size,
      });
    }
  }, [isFullscreen, documentPath, documentTitle, readSections]);

  const handleReadingSessionEnd = useCallback((timeSpent: number) => {
    setLastReadingTime((prev) => (prev ?? 0) + timeSpent);
    console.log(`Reading session ended: ${formatTimeInMs(timeSpent)}`);
  }, []);

  const startReading = useCallback(() => {
    addToHistory(documentPath, documentTitle).then(() => {
      console.log("Starting reading session:", documentPath, documentTitle);
      setIsFullscreen(true);
    });
  }, [addToHistory, documentPath, documentTitle]);

  const handleExitFullscreen = useCallback(async () => {
    if (readingStartTimeRef.current) {
      readSectionsAfterRef.current = new Set(readSections);

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
      }, 100);
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
    readSections,
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
      />
    );
  }

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorLoadingDocument error={error} />;
  if (!documentPath) return <NoFileSelectedYet />;

  const { totalWords, totalTime, totalSections } = metrics;
  const formattedReadTime = formatTimeInMs(totalTime);

  const CategoryIcon = getIconForTech(category);

  // Calculate section completion percentage for dialog
  const sectionsReadAfter =
    readSectionsAfterRef.current.size || readSections.size;
  const sectionCompletionPercent =
    (sectionsReadAfter / sections.length) * 100 || 0;

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
                        ? new Date(lastReadingTime).toLocaleDateString()
                        : "Not read"
                    }
                  />
                </div>
              </AnimatePresence>

              <StartReadingButton startReading={startReading} />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Reading Session Dialog */}
      <ReadingSessionDialog
        category={category}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        documentTitle={documentTitle}
        timeSpent={sessionTimeSpent}
        estimatedWordsRead={sessionWordsRead}
        sectionsRead={sectionsReadAfter}
        totalSections={sections.length}
        sectionsCompletedPercent={sectionCompletionPercent}
      />
    </AnimatePresence>
  );
};

export default DocumentPreview;
