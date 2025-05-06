import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/document-reading/preview/LoadingScreen";
import ErrorLoadingDocument from "@/components/document-reading/preview/ErrorLoadingDocument";
import FullScreenCardView from "@/components/document-reading/fullscreen/FullScreenCardView";
import NoFileSelectedYet from "@/components/document-reading/preview/NoFileSelectedYet";
import DetailPanel from "@/components/document-reading/preview/DetailPanel";
import getIconForTech from "@/components/shared/icons";
import Header from "@/components/document-reading/preview/Header";
import StartReadingButton from "@/components/document-reading/preview/StartReadingButton";
import SilentReadingTimeIntegration from "@/components/document-reading/preview/ReadingTimeTracker";
import { formatTimeInMs } from "@/utils/time";
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
 *
 * 🎨 Features lovely glass morphism effects and smooth transitions to create a premium feel
 * 🔍 Shows document metadata like word count, reading time, and sections
 * ⏱️ Silently tracks reading time without distracting the user
 * 📱 Fully responsive design that looks great on all devices
 * 🚀 Transitions seamlessly to fullscreen reading mode when ready
 *
 * Internal components:
 * - 🧩 Header: Displays the document title, category and quick stats at the top
 * - 📊 DetailPanel: Shows comprehensive document information in a structured format
 * - ▶️ StartReadingButton: Invites the user to begin their reading experience
 * - ⏱️ SilentReadingTimeIntegration: Tracks reading time without visible UI
 */
const DocumentPreview: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastReadingTime, setLastReadingTime] = useState<number | null>(null);
  const { documentPath = "" } = useParams<{ documentPath: string }>();

  const {
    loadedDocumentForUrl,
    loading,
    error,
    metrics,
    category,
    documentTitle,
  } = useCurrentDocument();

  const { addToHistory, getDocumentHistory } = useReadingHistory();

  const {
    startSectionReading,
    endReading,
    getSection,
    readSections,
    sections,
  } = useDocumentReading();

  // Load document when path changes
  useEffect(() => {
    const fullPath = documentPath.endsWith(".md")
      ? documentPath
      : `${documentPath}.md`;
    loadedDocumentForUrl(fullPath);
  }, [documentPath, loadedDocumentForUrl]);

  // Load previous reading time when document loads
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

  // Called when reading session ends
  const handleReadingSessionEnd = useCallback((timeSpent: number) => {
    setLastReadingTime((prev) => (prev || 0) + timeSpent);
    console.log(`Reading session ended: ${formatTimeInMs(timeSpent)}`);
  }, []);

  // Start reading in fullscreen mode
  const startReading = useCallback(() => {
    addToHistory(documentPath, documentTitle).then(() => {
      console.log("Starting reading session:", documentPath, documentTitle);
      setIsFullscreen(true);
    });
  }, [addToHistory, documentPath, documentTitle, setIsFullscreen]);

  // Handle exiting fullscreen mode
  const handleExitFullscreen = useCallback(() => {
    endReading().then(() => {
      setIsFullscreen(false);
    });
  }, [endReading]);

  if (isFullscreen) {
    return (
      <>
        <SilentReadingTimeIntegration
          documentPath={documentPath}
          documentTitle={documentTitle}
          isFullscreen={isFullscreen}
          onSessionComplete={handleReadingSessionEnd}
        />
        <FullScreenCardView
          onExit={endReading}
          onChangeSection={startSectionReading}
          sections={sections}
          getSection={(index: number) => getSection(index) ?? null}
          readSections={readSections}
          exitFullScreen={handleExitFullscreen}
        />
      </>
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
    </AnimatePresence>
  );
};

export default DocumentPreview;
