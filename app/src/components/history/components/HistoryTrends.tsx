import { Clock, PieChart as PieChartIcon } from "lucide-react";
import CardContainer from "@/components/container/CardContainer";
import { TimeOfTheDay } from "@/components/analytics/trends";
import CategoryPieChart from "@/components/insights/CategoryPieChart";
import { useCategoryStore } from "@/stores/categoryStore";

/**
 * 📊 HistoryTrends
 *
 * A beautiful visualization dashboard that shows reading patterns and habits!
 *
 * This component creates various charts to help users understand their reading behavior:
 * - Monthly reading trends to track progress over time 📈
 * - Day of week distribution to see which days they read most 📆
 * - Category breakdown to identify favorite topics 🍕
 * - Time of day patterns to reveal when they typically read 🕒
 *
 * The component is responsive with a special mobile view that uses collapsible
 * sections to save space, and a more expansive desktop layout.
 *
 * It analyzes the user's reading history to generate meaningful insights
 * and presents them in colorful, interactive charts.
 */
const HistoryTrends: React.FC = () => {
  const categoryBreakdown = useCategoryStore(
    (state) => state.categoryBreakdown
  );

  return (
    <div className="space-y-2 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <CardContainer
          title="Most Read Categories"
          icon={PieChartIcon}
          insights={[]}
          variant="subtle"
        >
          <CategoryPieChart categoryBreakdown={categoryBreakdown} />
        </CardContainer>

        <CardContainer
          title="Reading by Time of Day"
          icon={Clock}
          insights={[]}
          variant="subtle"
        >
          <TimeOfTheDay />
        </CardContainer>
      </div>
    </div>
  );
};

export default HistoryTrends;
