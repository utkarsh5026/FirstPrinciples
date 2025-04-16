import React, { useState, useEffect } from "react";
import { FileText, LayoutList, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/core/LoadingScreen";
import ErrorLoadingDocument from "./ErrorLoadingDocument";
import FullScreenCardView from "@/components/card/fullscreen/FullScreenCardView";
import NoFileSelectedYet from "./NoFileSelectedYet";
import ProgressPanel from "./ProgressPanel";
import DetailPanel from "./DetailPanel";
import StatCard from "./StatCard";
import PreviewPanel from "./PreviewPanel";
import getIconForTech from "@/components/icons";
import Header from "./Header";
import StartReadingButton from "./StartReadingButton";
import { formatTimeInMs } from "@/utils/time";
import { useCurrentDocumentStore } from "@/stores/currentDocumentStore";

interface DocumentPreviewProps {
  selectedFileUrl: string;
}

/**
 * Enhanced CardDocumentViewer component with an elegant, mobile-optimized design
 * Features beautiful animations, thoughtful visual hierarchy and sophisticated aesthetics
 */
const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  selectedFileUrl,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "info">("preview");

  const loading = useCurrentDocumentStore((state) => state.loading);
  const error = useCurrentDocumentStore((state) => state.error);
  const load = useCurrentDocumentStore((state) => state.load);
  const metrics = useCurrentDocumentStore((state) => state.metrics);
  const category = useCurrentDocumentStore((state) => state.category);
  const title = useCurrentDocumentStore((state) => state.title);
  const preview = useCurrentDocumentStore((state) => state.preview);

  useEffect(() => {
    console.log("selectedFileUrl", selectedFileUrl);
    load(selectedFileUrl);
  }, [selectedFileUrl, load]);

  const startReading = () => setIsFullscreen(true);

  const exitFullscreen = () => setIsFullscreen(false);

  if (isFullscreen) {
    return <FullScreenCardView onExit={exitFullscreen} />;
  }

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorLoadingDocument error={error} />;
  if (!selectedFileUrl) return <NoFileSelectedYet />;

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
              categoryIcon={<CategoryIcon className="h-3 w-3 mr-1.5" />}
              category={category}
              estimatedReadTime={formattedReadTime}
              lastUpdatedFormatted={new Date().toLocaleDateString()}
              totalSections={totalSections}
              documentTitle={title}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* Main content area */}
            <div className="px-6 sm:px-8 pb-8">
              <AnimatePresence mode="wait">
                {activeTab === "preview" ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[200px]"
                  >
                    <PreviewPanel excerpt={preview} />

                    {/* Enhanced reading progress display */}
                    <ProgressPanel readingProgress={0} />

                    {/* Section quick stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                      <StatCard
                        icon={
                          <LayoutList className="h-4 w-4 text-primary/70" />
                        }
                        label="Sections"
                        value={totalSections.toString() || "0"}
                      />

                      <StatCard
                        icon={<FileText className="h-4 w-4 text-primary/70" />}
                        label="Word Count"
                        value={totalWords.toLocaleString()}
                      />

                      <StatCard
                        icon={<Clock className="h-4 w-4 text-primary/70" />}
                        label="Reading Time"
                        value={formattedReadTime}
                        className="col-span-2 sm:col-span-1"
                      />
                    </div>
                  </motion.div>
                ) : (
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
                      selectedFile={selectedFileUrl}
                    />
                  </motion.div>
                )}
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
