import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

import { Zap, Award, Flame, Trophy, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAchievements, useXP } from "@/context";
import { useMemo } from "react";

const Header = () => {
  const { xpStats, formatXP } = useXP();
  const { achievements, newAchievements } = useAchievements();

  const overallCompletionPercentage = useMemo(() => {
    return achievements.length > 0
      ? Math.round(
          (achievements.filter((a) => a.unlockedAt !== null).length /
            achievements.length) *
            100
        )
      : 0;
  }, [achievements]);

  return (
    <Card className="p-4 border-primary/10 bg-gradient-to-r from-primary/10 to-transparent overflow-hidden relative rounded-2xl">
      <motion.div
        className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-primary flex items-center justify-center bg-background">
            <span className="text-2xl md:text-3xl font-bold">
              {xpStats.currentLevelXP}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
            <Zap className="h-4 w-4" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <Award className="h-4 w-4" /> Reading Level
            </h4>
            <span className="text-xs text-muted-foreground">
              {formatXP(xpStats.totalXP)} total XP
            </span>
          </div>

          <Progress value={xpStats.xpProgress} className="h-2" />

          <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
            <span>{formatXP(xpStats.currentLevelXP)} XP</span>
            <span>
              {formatXP(500 - (xpStats.totalXP % 500))} XP to level{" "}
              {xpStats.currentLevelXP + 1}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-background/30 text-xs">
              <Medal className="h-3 w-3 mr-1" />
              {achievements.filter((a) => a.unlockedAt !== null).length}/
              {achievements.length} Achievements
            </Badge>

            <Badge variant="outline" className="bg-background/30 text-xs">
              <Flame className="h-3 w-3 mr-1" />
              {newAchievements.length} New
            </Badge>

            <Badge variant="outline" className="bg-background/30 text-xs">
              <Trophy className="h-3 w-3 mr-1" />
              {Math.round(overallCompletionPercentage)}% Complete
            </Badge>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};

export default Header;
