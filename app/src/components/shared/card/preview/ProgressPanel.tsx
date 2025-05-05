import { BookOpen, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

const ProgressPanel: React.FC<{ readingProgress: number }> = ({
  readingProgress,
}) => {
  const getProgressColor = (percentage: number) => {
    if (percentage <= 0) return "bg-secondary/30";
    if (percentage < 30) return "bg-primary/60";
    if (percentage < 70) return "bg-primary/80";
    return "bg-primary";
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <div className="flex items-center">
          <BookOpen className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
          <span>Reading Progress</span>
        </div>
        <div className="flex items-center">
          {readingProgress > 0 ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1 text-primary/70" />
              <span>{readingProgress}%</span>
            </>
          ) : (
            <span>Not started yet</span>
          )}
        </div>
      </div>
      <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className={cn("h-full", getProgressColor(readingProgress))}
          initial={{ width: "0%" }}
          animate={{ width: `${readingProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressPanel;
