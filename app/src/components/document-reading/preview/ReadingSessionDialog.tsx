import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  BookOpen,
  BarChart,
  TrendingUp,
  Layers,
  Check,
  Brain,
} from "lucide-react";
import { formatTimeInMs } from "@/utils/time";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import getIconForTech from "@/components/shared/icons";

interface ReadingSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentTitle: string;
  timeSpent: number;
  estimatedWordsRead: number;
  sectionsRead: number;
  totalSections: number;
  sectionsCompletedPercent: number;
  category: string;
}

/**
 * Enhanced Reading Session Dialog Component
 *
 * A visually rich dialog that summarizes the user's reading session when they exit fullscreen mode.
 * Displays comprehensive reading statistics including time spent, words read, sections completed,
 * and insightful metrics about reading efficiency.
 */
const ReadingSessionDialog: React.FC<ReadingSessionDialogProps> = ({
  open,
  onOpenChange,
  documentTitle,
  timeSpent,
  estimatedWordsRead,
  sectionsRead,
  totalSections,
  sectionsCompletedPercent,
  category,
}) => {
  const formattedTime = formatTimeInMs(timeSpent);
  const minutesSpent = Math.round(timeSpent / (1000 * 60));
  const CategoryIcon = getIconForTech(category);

  const readingSpeed =
    timeSpent > 0
      ? Math.round(estimatedWordsRead / (timeSpent / 1000 / 60))
      : 0;

  const getEfficiencyLevel = () => {
    if (readingSpeed >= 350) return "Excellent";
    if (readingSpeed >= 250) return "Good";
    if (readingSpeed >= 150) return "Average";
    return "Relaxed";
  };

  const getProgressBarColorClass = () => {
    if (sectionsCompletedPercent >= 100) return "bg-primary";
    if (sectionsCompletedPercent >= 75) return "bg-primary/90";
    if (sectionsCompletedPercent >= 50) return "bg-primary/80";
    if (sectionsCompletedPercent >= 25) return "bg-primary/70";
    return "bg-primary/60";
  };

  // Define stat items data for the grid
  const statItems = [
    {
      icon: Clock,
      label: "Time",
      value: formattedTime,
    },
    {
      icon: BarChart,
      label: "Words",
      value: `~${estimatedWordsRead.toLocaleString()}`,
    },
    {
      icon: Layers,
      label: "Sections",
      value: `${sectionsRead} of ${totalSections}`,
      showCheck: sectionsRead === totalSections,
    },
    {
      icon: TrendingUp,
      label: "Speed",
      value: `${readingSpeed} WPM`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md font-cascadia-code max-w-[95vw] mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="h-5 w-5 text-primary" />
            </motion.div>
            <span>Reading Session</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {getInsight(
              sectionsRead,
              totalSections,
              sectionsCompletedPercent,
              readingSpeed,
              minutesSpent
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3">
          <div className="bg-card/50 p-4 rounded-2xl border border-border/50">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <CategoryIcon className="h-4 w-4 mr-2 text-primary/70" />
              <span className="truncate text-foreground/90">
                {documentTitle}
              </span>
            </h3>

            {/* Reading Progress Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {statItems.map(({ icon, label, value, showCheck }) => (
                <StatGridItem
                  key={label}
                  icon={icon}
                  label={label}
                  value={value}
                  showCheck={showCheck}
                />
              ))}
            </div>

            {/* Progress Bar */}
            {sectionsRead > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Document Progress</span>
                  <span>{Math.round(sectionsCompletedPercent)}%</span>
                </div>
                <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full", getProgressBarColorClass())}
                    initial={{ width: "0%" }}
                    animate={{ width: `${sectionsCompletedPercent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reading Insight */}
          <div className="flex mt-3 p-3 bg-secondary/5 border border-border/30 items-center rounded-2xl">
            <Brain className="h-5 w-5 text-primary/80 mr-3 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-medium text-foreground/90">
                Reading tip:
              </span>{" "}
              <span className="text-muted-foreground">
                {readingSpeed > 0
                  ? `Your reading speed (${readingSpeed} WPM) is at a ${getEfficiencyLevel().toLowerCase()} pace.`
                  : "Try reading at a comfortable pace that allows for good comprehension."}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="w-full transition-colors text-primary hover:text-primary rounded-2xl hover:bg-transparent cursor-pointer"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const getInsight = (
  sectionsRead: number,
  totalSections: number,
  sectionsCompletedPercent: number,
  readingSpeed: number,
  minutesSpent: number
) => {
  if (sectionsRead === 0)
    return "Try reading at least one complete section for better comprehension.";
  if (sectionsRead === totalSections)
    return "Congratulations on completing the entire document!";
  if (sectionsCompletedPercent >= 75)
    return "Great progress! You've read most of this document.";
  if (sectionsCompletedPercent >= 50)
    return "You're halfway there! Keep up the good work.";
  if (sectionsCompletedPercent >= 25)
    return "Good start! Continue to build your understanding.";
  if (readingSpeed > 400)
    return "You're reading quite fast. Consider slowing down for better retention.";
  if (readingSpeed < 100)
    return "You're taking your time. Deep reading improves understanding.";
  if (minutesSpent > 15)
    return "Excellent focus! Extended reading sessions help build comprehension.";
  return "Keep reading regularly to improve your knowledge and retention.";
};

interface StatGridItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  showCheck?: boolean;
}

const StatGridItem: React.FC<StatGridItemProps> = ({
  icon: Icon,
  label,
  value,
  showCheck,
}) => {
  return (
    <div className="flex flex-col items-center p-3 bg-secondary/10 rounded-2xl">
      <Icon className="h-5 w-5 text-primary mb-2" />

      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center">
        <span className="text-base font-bold">{value}</span>
        {showCheck && <Check className="h-3.5 w-3.5 ml-1 text-green-500" />}
      </div>
    </div>
  );
};

export default ReadingSessionDialog;
