import React from "react";
import { Brain, Calendar } from "lucide-react";
import CategoryPieChart from "@/components/insights/CategoryPieChart";
import ReadingByWeekDay from "@/components/insights/ReadingByWeekDay";
import { useActivityStore } from "@/stores";
import { useCategoryStore } from "@/stores/categoryStore";
import CardContainer from "@/components/container/CardContainer";

/**
 * 📚 ReadingInsights Component
 *
 * This component provides a delightful overview of your reading habits!
 * It showcases two main insights:
 *
 * 1. **Category Breakdown**: 🥳
 *    - Visualizes the categories of your reading materials using a pie chart.
 *    - It highlights the most read category, helping you understand your preferences better!
 *
 * 2. **Weekly Reading Patterns**: 📅
 *    - Displays your reading activity throughout the week, allowing you to see when you read the most.
 *    - If you haven't read much yet, it encourages you to read more to unlock your weekly patterns!
 *
 * The component utilizes hooks to compute the best day for reading and the best category based on your activity data.
 * It ensures that you have a clear and engaging view of your reading journey! 🌟
 */
const ReadingInsights: React.FC = () => {
  const weeklyActivity = useActivityStore((state) => state.totalWeeklyActivity);
  const categoryBreakdown = useCategoryStore(
    (state) => state.categoryBreakdown
  );

  return (
    <div className="flex flex-col gap-4">
      <CardContainer
        title="Categories Breakdown"
        icon={Brain}
        insights={[]}
        description="What do you read the most? 🤔"
        variant="subtle"
      >
        <div className="h-56 w-full">
          <CategoryPieChart
            descriptive={false}
            categoryBreakdown={categoryBreakdown}
          />
        </div>
      </CardContainer>

      {/* Weekly pattern */}
      <CardContainer
        title="Weekly Pattern"
        icon={Calendar}
        insights={[]}
        description="When do you read the most? 📅"
        variant="subtle"
      >
        {weeklyActivity.some((day) => day.count > 0) ? (
          <div className="h-52 w-full">
            <ReadingByWeekDay />
          </div>
        ) : (
          <div className="h-36 flex items-center justify-center text-center">
            <div className="text-muted-foreground text-xs">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>
                Read more to see
                <br />
                your weekly patterns
              </p>
            </div>
          </div>
        )}
      </CardContainer>
    </div>
  );
};

export default ReadingInsights;
