import React, { useCallback } from "react";
import ProgressBarWithLabel from "@/components/utils/ProgressBarWithLabel";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progressPercentage: number;
  readSections: Set<string>;
  sections: { id: string; title: string }[];
  currentIndex: number;
  setReadSections: (sections: Set<string>) => void;
}

/**
 * ProgressBar component displays a progress bar with detailed progress stats, progress controls, and progress stages visualization.
 *
 * @param {ProgressBarProps} props - The component props.
 * @param {number} props.progressPercentage - The percentage of progress to display.
 * @param {Set<string>} props.readSections - The set of read sections.
 * @param {Array<{ id: string; title: string }>} props.sections - The array of all sections.
 * @param {number} props.currentIndex - The index of the current section.
 * @param {(sections: Set<string>) => void} props.setReadSections - The function to set the read sections.
 *
 * @returns {React.ReactElement} The ProgressBar component.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPercentage,
  readSections,
  sections,
  currentIndex,
  setReadSections,
}) => {
  /**
   * Function to get the class for a section bar based on its read and current status.
   *
   * @param {boolean} isRead - Whether the section is read.
   * @param {boolean} isCurrent - Whether the section is the current one.
   *
   * @returns {string} The class for the section bar.
   */
  const getSectionBarClass = useCallback(
    (isRead: boolean, isCurrent: boolean) => {
      if (isRead) return "bg-primary/70";
      if (isCurrent) return "bg-primary/30";
      return "bg-secondary/30";
    },
    []
  );

  return (
    <div className="space-y-2 mt-6">
      <ProgressBarWithLabel progressPercentage={progressPercentage} />

      {/* Detailed progress stats */}
      <div className="flex justify-between items-center text-xs text-muted-foreground py-1">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-primary/80">
            {readSections.size}
          </span>{" "}
          of <span className="font-medium">{sections.length}</span> sections
          read
        </div>

        {/* Estimated reading time remaining */}
        <div className="text-xs">
          {sections.length - readSections.size > 0 ? (
            <span title="Estimated based on average reading speed">
              ~{Math.ceil((sections.length - readSections.size) * 1.5)} min left
            </span>
          ) : (
            <span className="text-primary/80 font-medium">Complete!</span>
          )}
        </div>
      </div>

      {/* Progress controls */}
      <div className="flex justify-between items-center pt-1">
        {/* Last read indicator */}
        <div className="text-xs text-muted-foreground">
          {readSections.size > 0 ? (
            <span>Last read: {new Date().toLocaleDateString()}</span>
          ) : (
            <span>Not started yet</span>
          )}
        </div>

        {/* Reset progress button */}
        <button
          onClick={() => {
            if (confirm("Reset your reading progress?")) {
              setReadSections(new Set());
              localStorage.removeItem("readCardSections");
            }
          }}
          className="text-xs text-primary/70 hover:text-primary hover:underline transition-colors"
        >
          Reset progress
        </button>
      </div>

      {/* Progress stages visualization */}
      <div className="flex gap-0.5 items-center mt-1">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            className={cn(
              "h-1 flex-grow transition-all duration-300",
              getSectionBarClass(
                readSections.has(section.id),
                idx === currentIndex
              )
            )}
            title={`${section.title} (${
              readSections.has(section.id) ? "Read" : "Unread"
            })`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
