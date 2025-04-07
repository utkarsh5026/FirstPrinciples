import React from "react";
import {
  Calendar,
  Award,
  Target,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  RefreshCcw,
  Zap,
  Lightbulb,
  BookOpen,
  BookText,
  Flame,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "../utils";
import type {
  ReadingAchievement,
  ReadingChallenge,
} from "@/utils/ReadingAnalyticsService";

const getAchievementIcon = (iconName: string) => {
  switch (iconName) {
    case "BookOpen":
      return <BookOpen size={18} />;
    case "BookText":
      return <BookText size={18} />;
    case "Lightbulb":
      return <Lightbulb size={18} />;
    case "Flame":
      return <Flame size={18} />;
    case "Target":
      return <Target size={18} />;
    case "Zap":
      return <Zap size={18} />;
    default:
      return <Award size={18} />;
  }
};

interface AchievementsProps {
  achievements: ReadingAchievement[];
  challenges: ReadingChallenge[];
  handleRefreshChallenges: () => void;
}

const Achievements: React.FC<AchievementsProps> = ({
  achievements,
  challenges,
  handleRefreshChallenges,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Unlocked Achievements */}
        <Card className="p-4 border-primary/10 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Unlocked Achievements</h3>
            <Badge variant="outline" className="text-xs">
              {achievements.filter((a) => a.unlockedAt !== null).length}/
              {achievements.length}
            </Badge>
          </div>

          <ScrollArea className="h-72">
            <div className="space-y-3">
              {achievements
                .filter((achievement) => achievement.unlockedAt !== null)
                .map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-3 rounded-3xl bg-primary/5 border border-primary/10"
                  >
                    <div className="mt-0.5 flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      {getAchievementIcon(achievement.icon)}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center">
                        <p className="font-medium text-sm">
                          {achievement.title}
                        </p>
                        <Sparkles className="h-3.5 w-3.5 ml-1.5 text-yellow-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>

                      {achievement.unlockedAt && (
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>
                            Unlocked {formatDate(achievement.unlockedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {achievements.filter((a) => a.unlockedAt !== null).length ===
                0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">No achievements yet</p>
                  <p className="text-xs mt-1">
                    Keep reading to unlock achievements
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Available Achievements */}
        <Card className="p-4 border-primary/10 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Available Achievements</h3>
            <Badge variant="outline" className="text-xs">
              Coming Soon
            </Badge>
          </div>

          <ScrollArea className="h-72">
            <div className="space-y-3">
              {achievements
                .filter((achievement) => achievement.unlockedAt === null)
                .map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/10"
                  >
                    <div className="mt-0.5 flex-shrink-0 h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-muted-foreground">
                      {getAchievementIcon(achievement.icon)}
                    </div>

                    <div className="flex-grow min-w-0">
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>

                      {achievement.progress !== undefined &&
                        achievement.maxProgress !== undefined && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>
                                {achievement.progress}/{achievement.maxProgress}
                              </span>
                            </div>
                            <Progress
                              value={
                                (achievement.progress /
                                  achievement.maxProgress) *
                                100
                              }
                              className="h-1.5"
                            />
                          </div>
                        )}
                    </div>
                  </div>
                ))}

              {achievements.filter((a) => a.unlockedAt === null).length ===
                0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">All achievements unlocked!</p>
                  <p className="text-xs mt-1">
                    You've completed all available achievements
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Reading Challenges Section */}
      <Card className="p-4 border-primary/10 mb-4 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Reading Challenges</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={handleRefreshChallenges}
          >
            <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {challenges.length > 0 ? (
            challenges.map((challenge) => {
              const isExpired =
                challenge.expiresAt !== null &&
                challenge.expiresAt < Date.now();
              const isCompleted = challenge.completed;

              return (
                <div
                  key={challenge.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    isCompleted
                      ? "bg-primary/5 border-primary/10"
                      : isExpired
                      ? "bg-secondary/5 border-secondary/10 opacity-60"
                      : "bg-secondary/5 border-secondary/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                        isCompleted
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary/20 text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Target className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p
                        className={cn(
                          "font-medium text-sm",
                          isCompleted && "text-primary"
                        )}
                      >
                        {challenge.title}
                        {isExpired && !isCompleted && (
                          <span className="ml-2 text-xs opacity-70">
                            (Expired)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {challenge.description}
                      </p>

                      {!isCompleted && !isExpired && (
                        <div className="mt-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              Progress: {challenge.progress}/{challenge.goal}
                            </span>
                            <span>{challenge.reward} XP</span>
                          </div>
                          <Progress
                            value={(challenge.progress / challenge.goal) * 100}
                            className="h-1.5 mt-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {isCompleted && (
                    <Badge className="bg-primary/20 text-primary border-none">
                      +{challenge.reward} XP
                    </Badge>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="font-medium">No active challenges</p>
              <p className="text-xs mt-1">
                Check back later for new challenges
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleRefreshChallenges}
              >
                <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
                Get New Challenges
              </Button>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default Achievements;
