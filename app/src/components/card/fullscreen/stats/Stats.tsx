import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSectionStore } from "@/stores";
import ReadingSummary from "./ReadingSummary";
import ReadingSpeedCurve from "./ReadingSpeedCurve";
import ProgressOverview from "./ProgressOverview";
import SectionCompletionMap from "./SectionCompletionMap";
import ReadingInsights from "./ReadingInsights";

interface StatsProps {
  toggleStats: () => void;
  documentPath: string;
  category: string;
  sections: Array<{ id: string; title: string; wordCount: number }>;
  currentIndex: number;
  readSections: Set<string>;
}

/**
 * Document-Focused Reading Stats
 *
 * An elegant, visually-rich stats panel that provides detailed insights
 * about the current document's reading progress, section breakdown,
 * and time spent on different parts of the content.
 */
const Stats: React.FC<StatsProps> = ({
  toggleStats,
  documentPath,
  category,
  sections,
  currentIndex,
  readSections,
}) => {
  // Section store hooks for section-specific analytics
  const getDocumentCompletionPercentage = useSectionStore(
    (state) => state.getDocumentCompletionPercentage
  );

  // Local state for document stats
  const [docStats, setDocStats] = useState({
    timeSpentBySection: [] as {
      sectionTitle: string;
      minutes: number;
      wordCount: number;
    }[],
    sectionReadTimes: [] as { id: string; timeSpent: number }[],
    readingSpeed: 0,
    completionPercentage: 0,
    estimatedTimeLeft: 0,
    loading: true,
  });

  // Calculate average word count per section
  const avgWordsPerSection = Math.ceil(
    sections.reduce((sum, section) => sum + section.wordCount, 0) /
      Math.max(1, sections.length)
  );

  // Calculate document completion
  const documentProgress = Math.round(
    (readSections.size / sections.length) * 100
  );

  // Calculate total words in document
  const totalWords = sections.reduce(
    (sum, section) => sum + section.wordCount,
    0
  );

  // Calculate total words read so far
  const wordsRead = sections
    .filter((section) => readSections.has(section.id))
    .reduce((sum, section) => sum + section.wordCount, 0);

  // Generate document-specific metrics
  useEffect(() => {
    const fetchDocumentStats = async () => {
      try {
        // Calculate section-specific reading times
        const completionPercentage = await getDocumentCompletionPercentage(
          documentPath,
          sections.length
        );

        // Mock section reading times (in a real app, this would come from your tracking system)
        // This simulates how long was spent on each section
        const mockSectionTimes = sections.map((section) => {
          // More complex sections (more words) take longer
          const baseTime = Math.max(60000, section.wordCount * 200); // minimum 1 minute
          // Apply some randomness to make it realistic
          const randomFactor = 0.7 + Math.random() * 0.6; // 0.7-1.3x multiplier
          const timeSpent = readSections.has(section.id)
            ? baseTime * randomFactor
            : 0;

          return {
            id: section.id,
            timeSpent: Math.round(timeSpent), // milliseconds
            completed: readSections.has(section.id),
          };
        });

        // Calculate time spent by section (for the chart)
        const timeSpentBySection = sections
          .map((section, idx) => {
            const sectionTime =
              mockSectionTimes.find((t) => t.id === section.id)?.timeSpent || 0;
            return {
              sectionTitle: `${idx + 1}. ${
                section.title.length > 15
                  ? section.title.substring(0, 15) + "..."
                  : section.title
              }`,
              minutes: Math.round(sectionTime / 60000),
              wordCount: section.wordCount,
              completed: readSections.has(section.id),
            };
          })
          .filter((section) => section.minutes > 0);

        // Calculate reading speed (WPM) based on read sections
        const totalTimeSpent = mockSectionTimes.reduce(
          (sum, section) => sum + section.timeSpent,
          0
        );
        const readingSpeed =
          totalTimeSpent > 0
            ? Math.round((wordsRead / totalTimeSpent) * 60000)
            : 250; // Default reading speed if no data

        // Estimate time left based on reading speed and remaining words
        const wordsLeft = totalWords - wordsRead;
        const estimatedTimeLeft =
          readingSpeed > 0 ? Math.ceil((wordsLeft / readingSpeed) * 60000) : 0;

        setDocStats({
          timeSpentBySection,
          sectionReadTimes: mockSectionTimes,
          readingSpeed,
          completionPercentage,
          estimatedTimeLeft,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching document stats:", error);
        setDocStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchDocumentStats();
  }, [
    documentPath,
    sections,
    readSections,
    getDocumentCompletionPercentage,
    wordsRead,
    totalWords,
  ]);

  // Get current date for the header
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Calculate reading curve - how reading speed changes across the document
  const prepareReadingCurve = () => {
    const readSectionsWithTime = docStats.sectionReadTimes
      .filter((section) => section.timeSpent > 0)
      .map((section) => {
        const sectionData = sections.find((s) => s.id === section.id);
        const wordCount = sectionData ? sectionData.wordCount : 0;
        const timeSpentMin = section.timeSpent / 60000;
        const wpm = timeSpentMin > 0 ? Math.round(wordCount / timeSpentMin) : 0;
        const index = sections.findIndex((s) => s.id === section.id) + 1;
        return { index, wpm };
      })
      .sort((a, b) => a.index - b.index);

    // If we have less than 2 read sections, we need to fabricate some data points
    if (readSectionsWithTime.length < 2) {
      if (readSectionsWithTime.length === 0) {
        // No reading data, create a flat curve at the average/default reading speed
        return Array.from({ length: sections.length }, (_, i) => ({
          index: i + 1,
          wpm: docStats.readingSpeed,
        }));
      } else {
        // Only one data point, create a small curve around it
        const point = readSectionsWithTime[0];
        return [
          { index: Math.max(1, point.index - 1), wpm: point.wpm * 0.9 },
          point,
          {
            index: Math.min(sections.length, point.index + 1),
            wpm: point.wpm * 1.1,
          },
        ];
      }
    }

    return readSectionsWithTime;
  };

  // Generate sections table with reading status
  const getSectionRows = () => {
    return sections.map((section, idx) => {
      const isRead = readSections.has(section.id);
      const isCurrent = idx === currentIndex;
      const timeSpent =
        docStats.sectionReadTimes.find((t) => t.id === section.id)?.timeSpent ||
        0;

      return {
        index: idx + 1,
        title: section.title,
        wordCount: section.wordCount,
        timeSpent,
        isRead,
        isCurrent,
      };
    });
  };

  // Determine color for intensity level

  // Calculate the time left to finish reading
  const getFormattedTimeLeft = (): string => {
    if (docStats.estimatedTimeLeft <= 0) return "Completed";

    const minutes = Math.floor(docStats.estimatedTimeLeft / 60000);
    if (minutes < 60) return `${minutes} min left`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m left`;
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25 }}
      className="fixed inset-0 bg-card z-50 overflow-y-auto md:p-24"
    >
      {/* Header with document title and close button */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm font-cascadia-code">
        <div>
          <h2 className="text-base font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Document Insights
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{currentDate}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleStats}
          className="h-8 w-8 rounded-full bg-primary/5 hover:bg-primary/10"
          aria-label="Close stats"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 sm:p-6">
        {docStats.loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-center">
              <div className="h-8 w-8 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                <BarChart2 className="h-4 w-4 text-primary/50 animate-pulse" />
              </div>
              <p className="text-muted-foreground">
                Analyzing your reading data...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-6">
            {/* Document Progress Overview - Featured stats card */}
            <ProgressOverview
              documentProgress={documentProgress}
              readSections={readSections}
              sections={sections}
              wordsRead={wordsRead}
              timeLeft={getFormattedTimeLeft()}
            />

            {/* Section Reading Insights - Visualizing time spent per section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ReadingInsights
                timeSpentBySection={docStats.timeSpentBySection}
              />

              {/* Reading Speed Curve - How reading speed changes across document */}
              <ReadingSpeedCurve readingCurve={prepareReadingCurve()} />
            </div>

            <SectionCompletionMap sections={getSectionRows()} />

            {/* Reading summary - Information about the document */}
            <ReadingSummary
              documentPath={documentPath}
              category={category}
              totalWords={totalWords}
              avgWordsPerSection={avgWordsPerSection}
              documentProgress={documentProgress}
              readingSpeed={docStats.readingSpeed}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Stats;
