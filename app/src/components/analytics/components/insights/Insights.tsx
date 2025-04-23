import { useReadingHistory } from "@/hooks";
import {
  TimeOfTheDayDistribution,
  WeeklyReadingPattern,
  ReadingProgress,
  DailyActivityInsight,
  CategoryCoverage,
  ReadingJourneyMap,
  CategoryDistribution,
} from "@/components/visualizations";
import Recommendations from "./Recommendation";
/**
 * EnhancedInsights - Main component that combines all insight cards
 *
 * This component arranges all the insight cards in a responsive grid layout,
 * optimized for both mobile and desktop viewing.
 */
const Insights = () => {
  const { history } = useReadingHistory();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <CategoryCoverage history={history} />
        <WeeklyReadingPattern history={history} />
        <TimeOfTheDayDistribution history={history} typeOfChart="area" />
        <ReadingProgress history={history} />
        <DailyActivityInsight history={history} />
        <CategoryDistribution history={history} typeOfChart="pie" />
      </div>
      <ReadingJourneyMap />
      <Recommendations
        readingHistory={history}
        radarData={[]}
        balanceScore={0}
        coverageScore={0}
        exploredCategories={0}
        totalCategories={0}
        handleSelectItem={() => {}}
      />
    </div>
  );
};

export default Insights;
