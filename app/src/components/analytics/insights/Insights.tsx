import { motion } from "framer-motion";
import { WeekdayPattern } from "./WeeklyPattern";
import TimeOfDayInsightCard from "./TimeoftheDayInsights";
import CategoryDistributionInsightCard from "./CategoryInsights";
import { ProgressTrendInsightCard } from "./ProgressTrendInsights";
import { useHistoryStore } from "@/stores";

/**
 * EnhancedInsights - Main component that combines all insight cards
 *
 * This component arranges all the insight cards in a responsive grid layout,
 * optimized for both mobile and desktop viewing.
 */
const Insights = () => {
  const history = useHistoryStore((state) => state.readingHistory);
  console.log(history);

  return (
    <div className="space-y-6">
      {/* Category filter component */}

      {/* Filtered insights cards */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1  gap-4 md:gap-6">
          <WeekdayPattern history={history} />
          <TimeOfDayInsightCard history={history} />
          <ProgressTrendInsightCard />
          <CategoryDistributionInsightCard history={history} />
        </div>
      </motion.div>
    </div>
  );
};

export default Insights;
