import React, { useState } from "react";
import {
  BarChart2,
  Clock,
  PieChart as PieChartIcon,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ReadingByWeekDay,
  TimeOfTheDay,
  MonthlyTrend,
} from "@/components/analytics/trends";
import CategoryPieChart from "@/components/analytics/category/insights/CategoryPieChart";

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
  /**
   * 🔍 Tracks which chart section is expanded in mobile view
   * Default is "monthly" to show the most comprehensive trend first!
   */
  const [openSection, setOpenSection] = useState<string>("monthly");

  return (
    <div className="space-y-2 md:space-y-6">
      <div className="md:hidden">
        <CollapsibleMobileChart
          openSection={openSection}
          setOpenSection={setOpenSection}
          id="monthly"
          title="Monthly Reading Trend"
          icon={<TrendingUp className="h-4 w-4 mr-2 text-primary/70" />}
        >
          <div className="h-56">
            <MonthlyTrend />
          </div>
        </CollapsibleMobileChart>

        <CollapsibleMobileChart
          openSection={openSection}
          setOpenSection={setOpenSection}
          id="weekday"
          title="Reading by Day of Week"
          icon={<BarChart2 className="h-4 w-4 mr-2 text-primary/70" />}
        >
          <ReadingByWeekDay />
        </CollapsibleMobileChart>

        <CollapsibleMobileChart
          openSection={openSection}
          setOpenSection={setOpenSection}
          id="categories"
          title="Most Read Categories"
          icon={<PieChartIcon className="h-4 w-4 mr-2 text-primary/70" />}
        >
          <div className="h-56 flex items-center">
            <CategoryPieChart
              extraProps={{
                innerRadius: 40,
                outerRadius: 70,
                paddingAngle: 5,
                stroke: "transparent",
                label: ({ name, percent }) =>
                  `${name.substring(0, 8)}${name.length > 8 ? ".." : ""} (${(
                    percent * 100
                  ).toFixed(0)}%)`,
              }}
              useThemeColors={false}
            />
          </div>
        </CollapsibleMobileChart>

        <CollapsibleMobileChart
          openSection={openSection}
          setOpenSection={setOpenSection}
          id="timeOfDay"
          title="Reading by Time of Day"
          icon={<Clock className="h-4 w-4 mr-2 text-primary/70" />}
        >
          <div className="h-56">
            <TimeOfTheDay />
          </div>
        </CollapsibleMobileChart>
      </div>

      {/* For desktop: original layout */}
      <div className="hidden md:block space-y-6">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-4 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-primary/70" />
            Monthly Reading Trend
          </h3>

          <div className="h-72">
            <MonthlyTrend />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekday Distribution */}
          <Card className="p-4 rounded-2xl">
            <h3 className="text-sm font-medium mb-4 flex items-center">
              <BarChart2 className="h-4 w-4 mr-2 text-primary/70" />
              Reading by Day of Week
            </h3>

            <div className="h-64">
              <ReadingByWeekDay />
            </div>
          </Card>

          {/* Category Distribution */}
          <Card className="p-4 rounded-2xl">
            <h3 className="text-sm font-medium mb-4 flex items-center">
              <PieChartIcon className="h-4 w-4 mr-2 text-primary/70" />
              Most Read Categories
            </h3>

            <div className="h-64 flex items-center">
              <CategoryPieChart
                extraProps={{
                  innerRadius: 40,
                  outerRadius: 70,
                  paddingAngle: 5,
                  stroke: "transparent",
                  label: ({ name, percent }) =>
                    `${name.substring(0, 8)}${name.length > 8 ? ".." : ""} (${(
                      percent * 100
                    ).toFixed(0)}%)`,
                }}
                useThemeColors={false}
              />
            </div>
          </Card>
        </div>

        {/* Time of Day Distribution */}
        <Card className="p-4 rounded-2xl">
          <h3 className="text-sm font-medium mb-4 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary/70" />
            Reading by Time of Day
          </h3>

          <div className="h-64">
            <TimeOfTheDay />
          </div>
        </Card>
      </div>
    </div>
  );
};

interface CollapsibleMobileChartProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  openSection: string;
  setOpenSection: (open: string) => void;
}

/**
 * 🎉 CollapsibleMobileChart
 *
 * This delightful component creates a collapsible section that can be expanded or
 * collapsed to show or hide its content! It's perfect for organizing information
 * in a user-friendly way, allowing users to focus on what they want to see.
 *
 * 🌟 The component features a title with an icon, making it visually appealing
 * and easy to understand. When the section is open, users can see the content
 * inside, and when it's closed, it saves space while still providing a clear
 * indication of what’s available.
 *
 * 🔄 The open/close state is managed through a simple hook, allowing for smooth
 * transitions and a delightful user experience.
 *
 * 🐾 Use this component to enhance your UI by providing collapsible sections
 * that keep your layout clean and organized!
 */
const CollapsibleMobileChart: React.FC<CollapsibleMobileChartProps> = ({
  id,
  title,
  icon,
  children,
  openSection,
  setOpenSection,
}) => (
  <Card className="p-3 md:p-4 mb-4 rounded-2xl">
    <Collapsible
      open={openSection === id}
      onOpenChange={(open) => setOpenSection(open ? id : "")}
    >
      <CollapsibleTrigger className="w-full flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center">
          {icon}
          {title}
        </h3>
        <ChevronDown
          className={`transition-transform h-4 w-4 text-muted-foreground ${
            openSection === id ? "transform rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">{children}</CollapsibleContent>
    </Collapsible>
  </Card>
);

export default HistoryTrends;
