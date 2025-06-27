import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ActivityIcon,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";

import Insights from "./components/insights";
import AnalyticsOverview from "./components/overview/analytics-overview";
import ReadingTimeline from "./components/timeline/reading-timeline";

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

const AnalyticsPage: React.FC = () => {
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
