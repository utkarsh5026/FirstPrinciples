import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  BarChart,
  TrendingUp,
  Layers,
  Check,
  Brain,
  ArrowRight,
  Trophy,
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
  sectionsReadInSession: number;
  totalSections: number;
  sectionsCompletedPercent: number;
  category: string;
  sectionsBeforeSession: number;
}

/**
 * Enhanced Reading Session Dialog Component
 *
 * A visually rich dialog that summarizes the user's reading session when they exit fullscreen mode.
 * Displays comprehensive reading statistics for the CURRENT SESSION including time spent, words read,
 * sections completed, and insightful metrics about reading efficiency.
 */
const ReadingSessionDialog: React.FC<ReadingSessionDialogProps> = ({
  open,
  onOpenChange,
  documentTitle,
  timeSpent,
  estimatedWordsRead,
  sectionsReadInSession,
  totalSections,
  sectionsCompletedPercent,
  category,
  sectionsBeforeSession,
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

  // Calculate how many more sections were completed in this session
  const newSectionsCompleted = sectionsReadInSession;

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
              <Trophy className="h-5 w-5 text-primary" />
            </motion.div>
            <span>Current Session Summary</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {getSessionInsight(
              sectionsReadInSession,
              totalSections,
              minutesSpent,
              readingSpeed
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
              <StatGridItem icon={Clock} label="Time" value={formattedTime} />
              <StatGridItem
                icon={BarChart}
                label="Words"
                value={`~${estimatedWordsRead.toLocaleString()}`}
              />
              <SessionStatGridItem
                icon={Layers}
                label="Sections"
                value={
                  sectionsReadInSession > 0 ? `+${sectionsReadInSession}` : "0"
                }
                total={totalSections}
                showCheck={sectionsReadInSession > 0}
              />
              <StatGridItem
                icon={TrendingUp}
                label="Speed"
                value={`${readingSpeed} WPM`}
              />
            </div>

            {/* Progress Bar for this session */}
            {sectionsBeforeSession < totalSections && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Document Progress</span>
                  <div className="flex items-center">
                    <span>{Math.round(sectionsCompletedPercent)}%</span>
                    {newSectionsCompleted > 0 && (
                      <span className="ml-1 text-primary flex items-center">
                        <ArrowRight className="h-3 w-3 mr-0.5" />+
                        {newSectionsCompleted}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                  {/* Show before session progress in lighter color */}
                  {sectionsBeforeSession > 0 && (
                    <div
                      className="h-full bg-primary/30"
                      style={{
                        width: `${
                          (sectionsBeforeSession / totalSections) * 100
                        }%`,
                      }}
                    />
                  )}

                  {/* Show this session's progress in brighter color */}
                  {newSectionsCompleted > 0 && (
                    <motion.div
                      className={cn("h-full", getProgressBarColorClass())}
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${
                          (newSectionsCompleted / totalSections) * 100
                        }%`,
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      style={{
                        marginLeft: `${
                          (sectionsBeforeSession / totalSections) * 100
                        }%`,
                      }}
                    />
                  )}
                </div>

                {/* Show visual legend for the progress bar */}
                {sectionsBeforeSession > 0 && newSectionsCompleted > 0 && (
                  <div className="flex items-center justify-end mt-1 text-xs text-muted-foreground">
                    <div className="flex items-center mr-3">
                      <div className="w-2 h-2 rounded-full bg-primary/30 mr-1.5"></div>
                      <span>Previous</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-1.5"></div>
                      <span>This session</span>
                    </div>
                  </div>
                )}
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

const getSessionInsight = (
  sectionsReadInSession: number,
  totalSections: number,
  minutesSpent: number,
  readingSpeed: number
) => {
  if (sectionsReadInSession === 0)
    return "You didn't complete any sections in this session. Try reading at least one full section next time.";
  if (sectionsReadInSession === totalSections)
    return "Amazing! You completed the entire document in this session.";
  if (sectionsReadInSession >= Math.floor(totalSections * 0.75))
    return "Impressive progress! You read most of the document in this session.";
  if (sectionsReadInSession >= Math.floor(totalSections * 0.5))
    return "Great work! You completed half of the document in this session.";
  if (sectionsReadInSession >= Math.floor(totalSections * 0.25))
    return "Good progress in this session! Keep building your understanding.";
  if (readingSpeed > 400)
    return "You're reading quite fast this session. Consider slowing down for better retention.";
  if (readingSpeed < 100)
    return "You're taking your time in this session. Careful reading improves understanding.";
  if (minutesSpent > 15)
    return "Excellent focus! Your extended reading session helps build deeper knowledge.";
  if (sectionsReadInSession > 0)
    return `You read ${sectionsReadInSession} ${
      sectionsReadInSession === 1 ? "section" : "sections"
    } in this session. Well done!`;
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

interface SessionStatGridItemProps extends StatGridItemProps {
  total: number;
}

const SessionStatGridItem: React.FC<SessionStatGridItemProps> = ({
  icon: Icon,
  label,
  value,
  total,
  showCheck,
}) => {
  return (
    <div className="flex flex-col items-center p-3 bg-secondary/10 rounded-2xl">
      <Icon className="h-5 w-5 text-primary mb-2" />

      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-col items-center">
        <div className="flex items-center">
          <span className="text-base font-bold">{value}</span>
          {showCheck && <Check className="h-3.5 w-3.5 ml-1 text-green-500" />}
        </div>
        <span className="text-xs text-muted-foreground mt-0.5">of {total}</span>
      </div>
    </div>
  );
};

export default ReadingSessionDialog;
