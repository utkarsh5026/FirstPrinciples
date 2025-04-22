import React, { useState, useCallback } from "react";
import { Flame, BookMarked } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/hooks/ui/use-theme";
import Confetti from "react-confetti";
import { useReadingHistory } from "@/hooks";
import CardContainer from "@/components/container/CardContainer";

/**
 * 🎯 DailyChallenge
 *
 * A fun component that tracks the user's daily reading progress and
 * celebrates their achievement with confetti when they complete the challenge!
 */
const DailyChallenge: React.FC = () => {
  const { history } = useReadingHistory();
  const { currentTheme } = useTheme();

  /**
   * 📊 Counts how many documents the user has read today
   */
  const todayReadsCount = history.filter((item) => {
    const today = new Date().setHours(0, 0, 0, 0);
    return new Date(item.lastReadAt).setHours(0, 0, 0, 0) === today;
  }).length;

  /**
   * 📈 Calculates the progress percentage for the progress bar
   */
  const progressPercentage = Math.min((todayReadsCount / 3) * 100, 100);
  const [showConfetti, setShowConfetti] = useState(false);

  /**
   * 🎉 Triggers the celebration confetti when user claims their reward
   */
  const handleClaimReward = useCallback(() => {
    if (todayReadsCount >= 3) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 8000);
    }
  }, [todayReadsCount]);

  return (
    <>
      {/* ✨ Confetti celebration animation */}
      {showConfetti && (
        <div className="top-0 left-0 fixed z-[1000] pointer-events-none w-max h-max">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={1200}
          />
        </div>
      )}

      <CardContainer
        title="Daily Challenge"
        icon={Flame}
        description="Complete the daily challenge to earn 50 XP"
        variant="emphasis"
        baseColor="green"
        headerAction={
          <Badge
            className="bg-primary/10 text-primary border-none rounded-full"
            variant="default"
          >
            {`Complete to celebrate 🎊`}
          </Badge>
        }
      >
        {/* 🎨 Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-30"></div>

        <div className="relative">
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
      </CardContainer>
    </>
  );
};

export default DailyChallenge;
