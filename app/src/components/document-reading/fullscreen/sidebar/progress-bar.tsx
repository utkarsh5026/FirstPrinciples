import React from "react";
import ProgressBarWithLabel from "@/components/utils/ProgressBarWithLabel";

interface ProgressBarProps {
  progressPercentage: number;
  readSectionsIndexes: Set<number>;
  sections: { id: number; title: string }[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPercentage,
  readSectionsIndexes,
  sections,
}) => {
  const readSectionsCount = readSectionsIndexes.size;

  return (
    <div className="space-y-2 mt-6">
      <ProgressBarWithLabel progressPercentage={progressPercentage} />

      <div className="flex justify-between items-center text-xs text-muted-foreground py-1">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-primary/80">
            {readSectionsCount}
          </span>{" "}
          of <span className="font-medium">{sections.length}</span> sections
          read
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
