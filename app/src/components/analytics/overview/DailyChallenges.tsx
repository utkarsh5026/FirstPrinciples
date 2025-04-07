import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, RefreshCw } from "lucide-react";
import type { ReadingChallenge } from "@/utils/ReadingAnalyticsService";
import { cn } from "@/lib/utils";

interface DailyChallengesProps {
  refreshChallenges: () => void;
  challenges: ReadingChallenge[];
}

const DailyChallenges: React.FC<DailyChallengesProps> = ({
  refreshChallenges,
  challenges,
}) => {
  return (
    <Card className="p-4 border-primary/10 rounded-3xl">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium flex items-center">
          <Target className="h-4 w-4 mr-2 text-primary" />
          Daily Challenges
        </h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => refreshChallenges()}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={cn(
              "p-3 border rounded-2xl",
              challenge.completed
                ? "border-green-500/20 bg-green-500/5"
                : "border-primary/10 bg-secondary/5"
            )}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium text-sm">{challenge.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {challenge.description}
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "ml-2 rounded-4xl",
                  challenge.completed
                    ? "border-green-500 text-green-500"
                    : "border-primary text-primary"
                )}
              >
                {challenge.reward} XP
              </Badge>
            </div>

            <div className="mt-2">
              <Progress
                value={(challenge.progress / challenge.goal) * 100}
                className={cn(
                  "h-1.5",
                  challenge.completed ? "bg-green-500" : ""
                )}
              />
              <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                <span>
                  Progress: {challenge.progress}/{challenge.goal}
                </span>
                {challenge.completed && <span>Completed!</span>}
              </div>
            </div>
          </div>
        ))}

        {challenges.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <div>No active challenges</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => refreshChallenges()}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh Challenges
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DailyChallenges;
