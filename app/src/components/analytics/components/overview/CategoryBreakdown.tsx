import React from "react";
import { Clock, BookText, PieChart as PieChartIcon } from "lucide-react";
import { CategoryPieChart } from "@/components/insights";
import { CategoryBreakdown } from "@/stores/categoryStore";
import TimeOfDayPreference from "@/components/insights/TimeOfDayPreference";
import CardContainer from "@/components/container/CardContainer";
interface CategoryBreakDownProps {
  categoryBreakdown: CategoryBreakdown[];
  readingByHour: { hour: number; count: number }[];
}

/**
 * 📊 CategoryBreakDown Component
 *
 * A delightful dashboard that visualizes your reading habits in two beautiful ways:
 *
 * 1. 📚 Reading by Category: Shows what types of content you love to read the most!
 *    Presents your reading preferences as a colorful pie chart that makes your
 *    reading journey more tangible and fun to explore.
 *
 * 2. ⏰ Reading by Time of Day: Reveals when you're most likely to curl up with a good read!
 *    Displays your reading patterns throughout the day with a smooth area chart,
 *    helping you discover your peak reading hours.
 *
 * Both visualizations provide empty states with friendly encouragement when you're
 * just starting your reading adventure! ✨
 */
const CategoryBreakDown: React.FC<CategoryBreakDownProps> = ({
  categoryBreakdown,
  readingByHour,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Category Breakdown */}
      <CardContainer
        title="Reading by Category"
        description="Shows what types of content you love to read the most!"
        icon={BookText}
        insights={[
          {
            label: "Total Categories",
            value: categoryBreakdown.length.toString(),
            icon: BookText,
            highlight: true,
          },
        ]}
        baseColor={"orange"}
        variant={"subtle"}
        delay={0.1}
      >
        {categoryBreakdown.length > 0 ? (
          <div className="h-full w-full">
            <CategoryPieChart categoryBreakdown={categoryBreakdown} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center flex-col">
            <PieChartIcon className="h-12 w-12 text-muted-foreground opacity-20 mb-3" />
            <p className="text-muted-foreground text-sm">
              No category data yet
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Read more documents to see category breakdowns
            </p>
          </div>
        )}
      </CardContainer>

      {/* Time of Day */}
      <CardContainer
        title="Reading by Time of Day"
        description="When you're most likely to read throughout the day"
        icon={Clock}
        insights={[]}
        baseColor={"blue"}
        variant={"subtle"}
        delay={0.2}
      >
        {readingByHour.some((item) => item.count > 0) ? (
          <TimeOfDayPreference
            readingByHour={readingByHour}
            descriptive={false}
          />
        ) : (
          <div className="h-64 flex items-center justify-center flex-col">
            <Clock className="h-12 w-12 text-muted-foreground opacity-20 mb-3" />
            <p className="text-muted-foreground text-sm">No time data yet</p>
            <p className="text-muted-foreground text-xs mt-1">
              Read more documents to see your reading schedule
            </p>
          </div>
        )}
      </CardContainer>
    </div>
  );
};

export default CategoryBreakDown;
