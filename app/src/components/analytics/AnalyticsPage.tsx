import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ActivityIcon,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";

import Insights from "./components/insights";
import AnalyticsOverview from "./components/overview/AnnalyticsOverview";
import ReadingTimeline from "./components/timeline/ReadingTimeline";

const tabs = [
  {
    title: "Overview",
    icon: <BarChart3 className="h-3.5 w-3.5" />,
  },
  {
    title: "Insights",
    icon: <PieChartIcon className="h-3.5 w-3.5" />,
  },
  {
    title: "Activity",
    icon: <ActivityIcon className="h-3.5 w-3.5" />,
  },
];

/**
 * AnalyticsPage Component
 *
 * A comprehensive analytics dashboard that displays user reading statistics,
 * achievements, activity patterns, and content insights.
 *
 * The component is organized into multiple tabs:
 * - Overview: General statistics and summary of user activity
 * - Activity: Detailed breakdown of reading patterns over time
 * - Achievements: User accomplishments and progress
 * - Insights: In-depth analysis of reading habits
 * - Deep: Category-specific insights and document recommendations
 *
 * @param {FileMetadata[]} availableDocuments - List of all available documents in the system
 * @param {Function} onSelectDocument - Callback function when a document is selected
 */
const AnalyticsPage: React.FC = () => {
  /**
  /**
   * Controls which analytics tab is currently active
   */
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full justify-start mb-6 overflow-x-auto">
        {tabs.map(({ title, icon }) => (
          <TabsTrigger
            key={title}
            value={title.toLowerCase()}
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            {icon} {title}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview">
        <AnalyticsOverview />
      </TabsContent>

      <TabsContent value="insights">
        <Insights />
      </TabsContent>

      <TabsContent value="activity">
        <ReadingTimeline />
      </TabsContent>
    </Tabs>
  );
};

export default AnalyticsPage;
