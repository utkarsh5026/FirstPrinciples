import React, { memo, useState, useCallback } from "react";
import { Flame, BookMarked } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/components/theme/context/ThemeContext";
import Confetti from "react-confetti";

interface DailyChallengeProps {
  todayReadsCount: number;
}

/**
 * DailyChallenge component displays the daily reading challenge progress and allows the user to claim a reward.
 *
 * @param {number} todayReadsCount - The number of documents read today.
 * @returns {React.ReactElement} - The DailyChallenge component.
 */
const DailyChallenge: React.FC<DailyChallengeProps> = memo(
  ({ todayReadsCount }) => {
    const { currentTheme } = useTheme();
    /**
     * Calculates the progress percentage based on the number of documents read today.
     *
     * @returns {number} - The progress percentage.
     */
    const progressPercentage = Math.min((todayReadsCount / 3) * 100, 100);
    const [showConfetti, setShowConfetti] = useState(false);

    /**
     * Handles the claim reward action by setting the confetti state to true for a short duration.
     */
    const handleClaimReward = useCallback(() => {
      if (todayReadsCount >= 3) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      }
    }, [todayReadsCount]);

    return (
      <>
        {/* Confetti celebration */}
        {showConfetti && (
          <div className="top-0 left-0 fixed z-[1000] pointer-events-none w-max h-max">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={800}
            />
          </div>
        )}

        <Card className="p-4 border-primary/10 hover:border-primary/30 transition-colors relative overflow-hidden rounded-3xl">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-30"></div>

          <div className="relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium flex items-center">
                <Flame className="mr-2 h-4 w-4 text-primary" />
                Daily Challenge
              </h3>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-none"
              >
                +50 XP
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <BookMarked className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Read 3 documents today</p>
                  <div className="flex items-center mt-1.5">
                    <Progress
                      value={progressPercentage}
                      className="h-1.5 w-32"
                      style={{
                        background: `${currentTheme.background}40`,
                      }}
                    />
                    <span className="ml-2 text-xs text-muted-foreground">
                      {todayReadsCount}/3
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant={todayReadsCount >= 3 ? "default" : "outline"}
                size="sm"
                className={`transition-all rounded-2xl ${
                  todayReadsCount >= 3
                    ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 scale-100 hover:scale-105 border border-primary/30 ring-2 ring-primary/20 animate-pulse"
                    : "text-muted-foreground bg-background/80"
                }`}
                onClick={handleClaimReward}
                disabled={todayReadsCount < 3}
              >
                {todayReadsCount >= 3 ? "Celebrate" : "In Progress"}
              </Button>
            </div>
          </div>
        </Card>
      </>
    );
  }
);

export default DailyChallenge;
