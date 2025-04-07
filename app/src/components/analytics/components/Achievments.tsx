import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy, Medal, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  ReadingStats,
  ReadingAchievement,
} from "@/utils/ReadingAnalyticsService";

interface AchievementsProps {
  stats: ReadingStats;
  xpProgress: number;
  xpToNextLevel: number;
  currentLevelXP: number;
  activeAchievements: ReadingAchievement[];
  achievements: ReadingAchievement[];
}

/**
 * The Achievements component displays the user's reading achievements, progress, and level.
 * It includes a card for XP and level, a section for achievements in progress, a section for unlocked achievements,
 * and a section for all achievements.
 *
 * @param {Object} props - The component props.
 * @param {ReadingStats} props.stats - The user's reading statistics.
 * @param {number} props.xpProgress - The user's current XP progress.
 * @param {number} props.xpToNextLevel - The XP required to reach the next level.
 * @param {number} props.currentLevelXP - The XP required for the current level.
 * @param {ReadingAchievement[]} props.activeAchievements - The achievements the user is currently working on.
 * @param {ReadingAchievement[]} props.achievements - All achievements available.
 *
 * @returns {JSX.Element} The Achievements component.
 */
const Achievements: React.FC<AchievementsProps> = ({
  stats,
  xpProgress,
  xpToNextLevel,
  currentLevelXP,
  activeAchievements,
  achievements,
}) => {
  return (
    <div className="space-y-6">
      {/* XP and Level Card */}
      <Card className="p-4 border-primary/10 bg-gradient-to-r from-primary/10 to-transparent overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-primary flex items-center justify-center bg-background">
              <span className="text-2xl md:text-3xl font-bold">
                {stats.level}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1">
              <Zap className="h-4 w-4" />
            </div>

            {/* Decorative element */}
            <div className="absolute -right-24 -bottom-24 opacity-5">
              <Zap className="h-48 w-48 text-primary" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="text-sm font-medium">Reading Level</h4>
              <span className="text-xs text-muted-foreground">
                {stats.totalXP} total XP
              </span>
            </div>

            <Progress value={xpProgress} className="h-2" />

            <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
              <span>{currentLevelXP} XP</span>
              <span>
                {xpToNextLevel - currentLevelXP} XP to level {stats.level + 1}
              </span>
            </div>

            <div className="mt-3 bg-background/30 p-2 rounded text-xs">
              Complete achievements and reading challenges to earn XP and level
              up
            </div>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Achievements in progress */}
        <Card className="p-4 border-primary/10">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium flex items-center">
              <Medal className="h-4 w-4 mr-2 text-primary" />
              In Progress
            </h4>
            <Badge variant="outline" className="text-xs">
              {activeAchievements.length} Active
            </Badge>
          </div>

          <div className="space-y-3">
            {activeAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-3 rounded-lg border border-primary/10 bg-secondary/5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium">
                        {achievement.title}
                      </div>
                      <Badge
                        variant="outline"
                        className="ml-1 border-primary/20 text-xs"
                      >
                        {achievement.progress}/{achievement.maxProgress}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {achievement.description}
                    </div>
                    <Progress
                      value={
                        (achievement.progress / achievement.maxProgress) * 100
                      }
                      className="h-1.5 mt-2"
                    />
                  </div>
                </div>
              </div>
            ))}

            {activeAchievements.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Medal className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No achievements in progress</p>
                <p className="text-xs mt-1">
                  Start reading to work toward achievements
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Unlocked Achievements */}
        <Card className="p-4 border-primary/10">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-primary" />
              Unlocked
            </h4>
            <Badge variant="outline" className="text-xs">
              {achievements.filter((a) => a.unlockedAt !== null).length}{" "}
              Achieved
            </Badge>
          </div>

          <div className="space-y-3">
            {achievements
              .filter((achievement) => achievement.unlockedAt !== null)
              .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
              .slice(0, 5)
              .map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-3 rounded-lg border border-primary/10 bg-primary/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium">
                          {achievement.title}
                        </div>
                        <Badge
                          variant="outline"
                          className="ml-1 border-green-500/30 text-green-500 text-xs"
                        >
                          Completed
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {achievement.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1.5">
                        Unlocked:{" "}
                        {achievement.unlockedAt
                          ? new Date(
                              achievement.unlockedAt
                            ).toLocaleDateString()
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {achievements.filter((a) => a.unlockedAt !== null).length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No achievements unlocked yet</p>
                <p className="text-xs mt-1">
                  Keep reading to earn achievements
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* All Achievements */}
      <Card className="p-4 border-primary/10">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium flex items-center">
            <ListTodo className="h-4 w-4 mr-2 text-primary" />
            All Achievements
          </h4>
          <div className="text-xs text-muted-foreground">
            {achievements.filter((a) => a.unlockedAt !== null).length}/
            {achievements.length} Completed
          </div>
        </div>

        <Progress
          value={
            (achievements.filter((a) => a.unlockedAt !== null).length /
              achievements.length) *
            100
          }
          className="h-2 mb-6"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {achievements.map((achievement) => {
            const isUnlocked = achievement.unlockedAt !== null;
            return (
              <div
                key={achievement.id}
                className={cn(
                  "p-3 rounded-lg border",
                  isUnlocked
                    ? "border-primary/20 bg-primary/5"
                    : "border-border/50 bg-secondary/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                      isUnlocked ? "bg-primary/20" : "bg-secondary/20"
                    )}
                  >
                    <Trophy
                      className={cn(
                        "h-4 w-4",
                        isUnlocked ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div
                        className={cn(
                          "text-sm",
                          isUnlocked ? "font-medium" : "text-muted-foreground"
                        )}
                      >
                        {achievement.title}
                      </div>

                      {isUnlocked ? (
                        <Badge
                          variant="outline"
                          className="border-green-500/30 text-green-500 text-xs"
                        >
                          +75 XP
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground"
                        >
                          {achievement.progress}/{achievement.maxProgress}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {achievement.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Achievements;
