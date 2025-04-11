import { Progress } from "@/components/ui/progress";
import { useReadingMetrics, useReadingHistory } from "@/context";
import { useMemo } from "react";
import { BookText } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { fromSnakeToTitleCase } from "@/utils/string";
import getIconForTech from "@/components/icons";

const CategoriesExplored = () => {
  const { analyticsData } = useReadingMetrics();
  const { categoryBreakdown } = analyticsData;
  const { readingHistory } = useReadingHistory();

  const categoryCoverage = useMemo(() => {
    return categoryBreakdown.map((category) => {
      const categoryDocs = readingHistory.filter((item) =>
        item.path.startsWith(category.name)
      ).length;
      const percentage = Math.round(
        (categoryDocs / readingHistory.length) * 100
      );
      return {
        name: category.name,
        value: percentage,
      };
    });
  }, [categoryBreakdown, readingHistory]);

  if (categoryCoverage.length === 0) {
    return (
      <div className="h-full flex items-center justify-center flex-col">
        <BookText className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
        <p className="text-xs text-muted-foreground">
          No categories explored yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categoryCoverage.map(({ name, value }, index) => {
        const CategoryIcon = getIconForTech(name);
        const color = COLORS[index % COLORS.length];
        return (
          <div key={name} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: color,
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <div className="flex items-center gap-2">
                  <CategoryIcon className="w-4 h-4" style={{ color }} />
                  <div className="text-sm truncate">
                    {fromSnakeToTitleCase(name)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{value}%</div>
              </div>
              <Progress
                value={value}
                className="h-1.5 mt-1"
                style={
                  {
                    backgroundColor: `${COLORS[index % COLORS.length]}33`,
                    "--progress-value": `${COLORS[index % COLORS.length]}`,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoriesExplored;
