import { Card } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAchievements } from "@/context";
import { useMemo } from "react";

const ProgressSummary = () => {
  const { achievements } = useAchievements();

  const overallCompletionPercentage = useMemo(() => {
    return achievements.length > 0
      ? Math.round(
          (achievements.filter((a) => a.unlockedAt !== null).length /
            achievements.length) *
            100
        )
      : 0;
  }, [achievements]);

  const tierStats = useMemo(() => {
    return {
      bronze: achievements.filter((a) => a.tier === "bronze"),
      silver: achievements.filter((a) => a.tier === "silver"),
      gold: achievements.filter((a) => a.tier === "gold"),
      platinum: achievements.filter((a) => a.tier === "platinum"),
    };
  }, [achievements]);

  const tierCompletionPercentages = useMemo(() => {
    return {
      bronze:
        tierStats.bronze.length > 0
          ? Math.round(
              (tierStats.bronze.filter((a) => a.unlockedAt !== null).length /
                tierStats.bronze.length) *
                100
            )
          : 0,
      silver:
        tierStats.silver.length > 0
          ? Math.round(
              (tierStats.silver.filter((a) => a.unlockedAt !== null).length /
                tierStats.silver.length) *
                100
            )
          : 0,
      gold:
        tierStats.gold.length > 0
          ? Math.round(
              (tierStats.gold.filter((a) => a.unlockedAt !== null).length /
                tierStats.gold.length) *
                100
            )
          : 0,
      platinum:
        tierStats.platinum.length > 0
          ? Math.round(
              (tierStats.platinum.filter((a) => a.unlockedAt !== null).length /
                tierStats.platinum.length) *
                100
            )
          : 0,
    };
  }, [tierStats]);

  return (
    <Card className="p-4 border-border rounded-2xl">
      <h3 className="font-semibold flex items-center gap-2 mb-4">
        <BarChart className="h-5 w-5 text-primary" />
        <span>Achievement Progress</span>
      </h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {achievements.filter((a) => a.unlockedAt !== null).length}/
              {achievements.length}
            </span>
          </div>
          <Progress value={overallCompletionPercentage} className="h-2.5" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium flex items-center gap-1">
                <Badge className="bg-amber-300 h-2 w-2 p-0 rounded-full" />
                Bronze
              </span>
              <span className="text-xs text-muted-foreground">
                {tierStats.bronze.filter((a) => a.unlockedAt !== null).length}/
                {tierStats.bronze.length}
              </span>
            </div>
            <Progress
              value={tierCompletionPercentages.bronze}
              className="h-1.5 bg-secondary/50"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium flex items-center gap-1">
                <Badge className="bg-slate-300 h-2 w-2 p-0 rounded-full" />
                Silver
              </span>
              <span className="text-xs text-muted-foreground">
                {tierStats.silver.filter((a) => a.unlockedAt !== null).length}/
                {tierStats.silver.length}
              </span>
            </div>
            <Progress
              value={tierCompletionPercentages.silver}
              className="h-1.5 bg-secondary/50"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium flex items-center gap-1">
                <Badge className="bg-yellow-300 h-2 w-2 p-0 rounded-full" />
                Gold
              </span>
              <span className="text-xs text-muted-foreground">
                {tierStats.gold.filter((a) => a.unlockedAt !== null).length}/
                {tierStats.gold.length}
              </span>
            </div>
            <Progress
              value={tierCompletionPercentages.gold}
              className="h-1.5 bg-secondary/50"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium flex items-center gap-1">
                <Badge className="bg-indigo-300 h-2 w-2 p-0 rounded-full" />
                Platinum
              </span>
              <span className="text-xs text-muted-foreground">
                {tierStats.platinum.filter((a) => a.unlockedAt !== null).length}
                /{tierStats.platinum.length}
              </span>
            </div>
            <Progress
              value={tierCompletionPercentages.platinum}
              className="h-1.5 bg-secondary/50"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProgressSummary;
