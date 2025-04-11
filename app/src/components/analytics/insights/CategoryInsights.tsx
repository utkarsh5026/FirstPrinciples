import React from "react";
import { Card } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { CategoriesExplored, CategoryPieChart } from "@/components/insights";
import { fromSnakeToTitleCase } from "@/utils/string";

/**
 * 🎉 CategoryInsights Component
 *
 * This delightful component showcases the user's reading habits across different categories!
 * It provides a visual representation of how many documents have been read in each category,
 * helping users understand their reading preferences better. 📚✨
 *
 * With a charming pie chart, users can easily see the distribution of their reading across
 * various categories, making it fun to explore their reading journey! 🌈
 *
 * Additionally, it highlights the categories explored by the user, showing how many documents
 * have been read in each category. This encourages users to dive deeper into their reading
 * habits and discover new genres! 📖💖
 *
 * If there are no categories explored yet, it gently nudges users to read more to fill
 * their reading palette! 🌟
 */
const CategoryInsights: React.FC = () => {
  return (
    <Card className="p-4 border-primary/10 rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium flex items-center">
          <Filter className="h-4 w-4 mr-2 text-primary" />
          Category Insights
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="space-y-2">
          <h5 className="text-xs uppercase text-muted-foreground font-medium">
            Distribution
          </h5>

          <div className="h-48">
            <CategoryPieChart
              useThemeColors={false}
              showTooltip
              showLegend={false}
              extraProps={{
                labelLine: true,
                label: ({ name }) => {
                  return `${fromSnakeToTitleCase(name)}`;
                },
              }}
            />
          </div>
        </div>

        {/* Categories Explored */}
        <div className="space-y-2">
          <h5 className="text-xs uppercase text-muted-foreground font-medium">
            Categories Explored
          </h5>

          <div className="h-48 overflow-auto">
            <CategoriesExplored />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CategoryInsights;
