import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Trophy, Check } from "lucide-react";
import { useAchievements } from "@/context";
import AchievementCard from "./AchievmentCard";
import { enhancedAchievementService } from "@/services/analytics/AchievmentService";

const NewAchievments = () => {
  const { newAchievements } = useAchievements();

  const handleAcknowledgeAchievement = async (id: string) => {
    try {
      await enhancedAchievementService.acknowledgeAchievement(id);
    } catch (error) {
      console.error("Error acknowledging achievement:", error);
    }
  };

  return (
    <Card className="p-4 border-primary/30 bg-primary/5 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <span>New Achievements</span>
        </h3>

        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-primary/10 transition-colors rounded-2xl"
          onClick={() => {
            Promise.all(
              newAchievements.map((a) =>
                enhancedAchievementService.acknowledgeAchievement(a.id)
              )
            ).then(() => {});
          }}
        >
          <Check className="h-3 w-3 mr-1" />
          Mark all as seen
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {newAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            showAnimation={true}
            onClick={() => handleAcknowledgeAchievement(achievement.id)}
          />
        ))}
      </div>
    </Card>
  );
};

export default NewAchievments;
