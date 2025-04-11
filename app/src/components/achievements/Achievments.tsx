import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock, Award, Search, Check } from "lucide-react";
import AchievementCard from "./AchievmentCard";
import { type AchievementCategory } from "@/services/analytics/AchievmentService";
import { cn } from "@/lib/utils";
import { useAchievements } from "@/context";

import { categoryInfo } from "./assets";
import Header from "./Header";
import ProgressSummary from "./ProgressSummary";
import NewAchievments from "./NewAchievments";

export const Achievements = () => {
  const { achievements, newAchievements } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<
    AchievementCategory | "all"
  >("all");
  const [searchValue, setSearchValue] = useState("");
  const [showUnlocked, setShowUnlocked] = useState(true);
  const [showLocked, setShowLocked] = useState(true);

  const filteredAchievements = achievements.filter((achievement) => {
    // Filter by category
    if (
      selectedCategory !== "all" &&
      achievement.category !== selectedCategory
    ) {
      return false;
    }

    // Filter by search
    if (
      searchValue &&
      !achievement.title.toLowerCase().includes(searchValue.toLowerCase())
    ) {
      return false;
    }

    // Filter by locked/unlocked status
    if (!showUnlocked && achievement.unlockedAt !== null) {
      return false;
    }

    if (!showLocked && achievement.unlockedAt === null) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <Header />
      {newAchievements.length > 0 && <NewAchievments />}
      <ProgressSummary />

      <Card className="border-border rounded-2xl overflow-hidden">
        <Tabs
          defaultValue="all"
          onValueChange={(value) =>
            setSelectedCategory(value as AchievementCategory)
          }
        >
          <div className="p-4 pb-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Achievement Categories</h3>

              <div className="relative">
                <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search achievements..."
                  className="pl-8 py-1 pr-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setShowUnlocked(!showUnlocked)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1",
                  showUnlocked
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                <Check className="h-3 w-3" />
                Unlocked
              </button>

              <button
                onClick={() => setShowLocked(!showLocked)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1",
                  showLocked
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                <Lock className="h-3 w-3" />
                Locked
              </button>
            </div>

            <TabsList className="grid grid-cols-4 md:grid-cols-8 h-auto bg-transparent p-0 gap-1">
              <TabsTrigger
                value="all"
                className="text-xs py-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <span className="flex flex-col items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span className="hidden md:inline">All</span>
                </span>
              </TabsTrigger>

              {(Object.keys(categoryInfo) as AchievementCategory[]).map(
                (category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className={cn(
                      "text-xs py-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary",
                      categoryInfo[category].color
                    )}
                  >
                    <span className="flex flex-col items-center gap-1">
                      {categoryInfo[category].icon}
                      <span className="hidden md:inline truncate">
                        {categoryInfo[category].name}
                      </span>
                    </span>
                  </TabsTrigger>
                )
              )}
            </TabsList>
          </div>

          <Separator className="my-2" />

          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[400px] md:h-[500px] p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAchievements.length > 0 ? (
                  filteredAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Award className="h-12 w-12 mb-2 opacity-20" />
                    <p>No achievements match your filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {(Object.keys(categoryInfo) as AchievementCategory[]).map(
            (category) => (
              <TabsContent key={category} value={category} className="m-0">
                <div className="p-4 pb-2">
                  <p className="text-sm text-muted-foreground">
                    {categoryInfo[category].description}
                  </p>
                </div>

                <ScrollArea className="h-[400px] md:h-[450px] p-4 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredAchievements.length > 0 ? (
                      filteredAchievements.map((achievement) => (
                        <AchievementCard
                          key={achievement.id}
                          achievement={achievement}
                        />
                      ))
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Award className="h-12 w-12 mb-2 opacity-20" />
                        <p>No achievements match your filters</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            )
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default Achievements;
