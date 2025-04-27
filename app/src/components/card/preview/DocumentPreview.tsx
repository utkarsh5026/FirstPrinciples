import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/card/preview/LoadingScreen";
import ErrorLoadingDocument from "@/components/card/preview/ErrorLoadingDocument";
import FullScreenCardView from "@/components/card/fullscreen/FullScreenCardView";
import NoFileSelectedYet from "@/components/card/preview/NoFileSelectedYet";
import DetailPanel from "@/components/card/preview/DetailPanel";
import getIconForTech from "@/components/icons";
import Header from "@/components/card/preview/Header";
import StartReadingButton from "@/components/card/preview/StartReadingButton";
import { formatTimeInMs } from "@/utils/time";
import { useCurrentDocument, useReadingHistory } from "@/hooks";
import { useParams } from "react-router-dom";

/**
 * 📄✨ DocumentPreview
 *
 * A beautiful document preview component that displays information about the selected document
 * in an elegant card format with sophisticated animations and visual effects.
 *
 * 🎨 Features lovely glass morphism effects and smooth transitions to create a premium feel
 * 🔍 Shows document metadata like word count, reading time, and sections
 * 📱 Fully responsive design that looks great on all devices
 * 🚀 Transitions seamlessly to fullscreen reading mode when ready
 *
 * Internal components:
 * - 🧩 Header: Displays the document title, category and quick stats at the top
 * - 📊 DetailPanel: Shows comprehensive document information in a structured format
 * - ▶️ StartReadingButton: Invites the user to begin their reading experience
 */
const DocumentPreview: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { documentPath = "" } = useParams<{ documentPath: string }>();

  const {
    loadedDocumentForUrl,
    loading,
    error,
    metrics,
    category,
    documentTitle,
  } = useCurrentDocument();
  const { addToHistory } = useReadingHistory();

  console.log(
    "DocumentPreview",
    documentPath,
    decodeURIComponent(documentPath)
  );

  useEffect(() => {
    const fullPath = documentPath.endsWith(".md")
      ? documentPath
      : `${documentPath}.md`;
    loadedDocumentForUrl(fullPath);
  }, [documentPath, loadedDocumentForUrl]);

  const startReading = () => {
    addToHistory(documentPath, documentTitle).then(() => {
      console.log("Starting reading", documentPath, documentTitle);
      setIsFullscreen(true);
    });
  };

  const exitFullscreen = () => setIsFullscreen(false);

  if (isFullscreen) {
    return <FullScreenCardView onExit={exitFullscreen} />;
  }

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorLoadingDocument error={error} />;
  if (!documentPath) return <NoFileSelectedYet />;

  const { totalWords, totalTime, totalSections } = metrics;
  const formattedReadTime = formatTimeInMs(totalTime);

  const CategoryIcon = getIconForTech(category);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full mx-auto max-w-4xl mb-8 font-cascadia-code px-4 sm:px-6"
      >
        {/* Main card with sophisticated glass morphism effect */}
        <motion.div
          className="bg-card/90 backdrop-blur-md rounded-3xl border border-border/30 overflow-hidden relative"
          style={{
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 20px -5px rgba(0, 0, 0, 0.1)",
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle gradient decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-80" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-70" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-70" />

          {/* Content container */}
          <div className="relative z-10">
            {/* Header section */}
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
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 min-h-[200px]"
                >
                  {/* Enhanced document details panel */}
                  <DetailPanel
                    totalSections={totalSections}
                    wordCount={totalWords}
                    estimatedReadTime={parseInt(
                      formattedReadTime.split(":")[0]
                    )}
                    lastUpdatedFormatted={new Date().toLocaleDateString()}
                    selectedFile={documentPath}
                  />
                </motion.div>
              </AnimatePresence>

              <StartReadingButton startReading={startReading} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DocumentPreview;
