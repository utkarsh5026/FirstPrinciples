import React, { memo, useState, useMemo } from "react";
import {
  BarChart2,
  Clock,
  PieChart as PieChartIcon,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ReadingHistoryItem } from "@/components/home/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { COLORS } from "@/components/analytics/utils";

interface HistoryTrendsProps {
  readingHistory: ReadingHistoryItem[];
  monthlyData: {
    name: string;
    count: number;
    date: Date;
  }[];
  currentTheme: {
    primary: string;
    secondary: string;
    [key: string]: string;
  };
}

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
const HistoryTrends: React.FC<HistoryTrendsProps> = memo(
  ({ readingHistory, monthlyData, currentTheme }) => {
    /**
     * 🔍 Tracks which chart section is expanded in mobile view
     * Default is "monthly" to show the most comprehensive trend first!
     */
    const [openSection, setOpenSection] = useState<string>("monthly");

    /**
     * 🧮 Processes reading history into meaningful chart data
     * Calculates reading patterns by weekday, time of day, and categories
     * Only recalculates when reading history changes for better performance
     */
    const { weekdayData, timeOfDayData, categoryData } = useMemo(() => {
      const weekdayData = [
        { name: "Mon", count: 0 },
        { name: "Tue", count: 0 },
        { name: "Wed", count: 0 },
        { name: "Thu", count: 0 },
        { name: "Fri", count: 0 },
        { name: "Sat", count: 0 },
        { name: "Sun", count: 0 },
      ];

      readingHistory.forEach((item) => {
        const day = new Date(item.lastReadAt).getDay();
        const index = day === 0 ? 6 : day - 1;
        weekdayData[index].count++;
      });

      const timeOfDayData = [
        { name: "Morning", count: 0, color: "#FFB347" },
        { name: "Afternoon", count: 0, color: "#FFD700" },
        { name: "Evening", count: 0, color: "#9370DB" },
        { name: "Night", count: 0, color: "#6A5ACD" },
      ];

      readingHistory.forEach((item) => {
        const hour = new Date(item.lastReadAt).getHours();

        switch (true) {
          case hour >= 5 && hour < 12:
            timeOfDayData[0].count++;
            break;
          case hour >= 12 && hour < 17:
            timeOfDayData[1].count++;
            break;
          case hour >= 17 && hour < 21:
            timeOfDayData[2].count++;
            break;
          default:
            timeOfDayData[3].count++;
            break;
        }
      });

      // Generate category distribution
      const categoryMap: Record<string, number> = {};
      readingHistory.forEach((item) => {
        const category = item.path.split("/")[0] || "uncategorized";
        categoryMap[category] = (categoryMap[category] || 0) + 1;
      });

      const categoryData = Object.entries(categoryMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return { weekdayData, timeOfDayData, categoryData };
    }, [readingHistory]);

    const customTooltipStyle = {
      background: currentTheme.cardBg || "#ffffff",
      border: `1px solid ${currentTheme.border}`,
      borderRadius: "4px",
      color: currentTheme.foreground,
    };

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
              <MonthlyReadingTrend
                monthlyData={monthlyData}
                customTooltipStyle={customTooltipStyle}
              />
            </div>
          </CollapsibleMobileChart>

          <CollapsibleMobileChart
            openSection={openSection}
            setOpenSection={setOpenSection}
            id="weekday"
            title="Reading by Day of Week"
            icon={<BarChart2 className="h-4 w-4 mr-2 text-primary/70" />}
          >
            <ReadingByWeekDay
              weekdayData={weekdayData}
              customTooltipStyle={customTooltipStyle}
            />
          </CollapsibleMobileChart>

          <CollapsibleMobileChart
            openSection={openSection}
            setOpenSection={setOpenSection}
            id="categories"
            title="Most Read Categories"
            icon={<PieChartIcon className="h-4 w-4 mr-2 text-primary/70" />}
          >
            {categoryData.length > 0 ? (
              <div className="h-56 flex items-center">
                <CategoryPieChart
                  categoryData={categoryData}
                  customTooltipStyle={customTooltipStyle}
                />
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <PieChartIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Not enough data to show categories</p>
                </div>
              </div>
            )}
          </CollapsibleMobileChart>

          <CollapsibleMobileChart
            openSection={openSection}
            setOpenSection={setOpenSection}
            id="timeOfDay"
            title="Reading by Time of Day"
            icon={<Clock className="h-4 w-4 mr-2 text-primary/70" />}
          >
            <div className="h-56">
              <TimeOfTheData
                timeOfDayData={timeOfDayData}
                customTooltipStyle={customTooltipStyle}
              />
            </div>
          </CollapsibleMobileChart>
        </div>

        {/* For desktop: original layout */}
        <div className="hidden md:block space-y-6">
          {/* Monthly Reading Trend */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-primary/70" />
              Monthly Reading Trend
            </h3>

            <div className="h-72">
              <MonthlyReadingTrend
                monthlyData={monthlyData}
                customTooltipStyle={customTooltipStyle}
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekday Distribution */}
            <Card className="p-4">
              <h3 className="text-sm font-medium mb-4 flex items-center">
                <BarChart2 className="h-4 w-4 mr-2 text-primary/70" />
                Reading by Day of Week
              </h3>

              <div className="h-64">
                <ReadingByWeekDay
                  weekdayData={weekdayData}
                  customTooltipStyle={customTooltipStyle}
                />
              </div>
            </Card>

            {/* Category Distribution */}
            <Card className="p-4">
              <h3 className="text-sm font-medium mb-4 flex items-center">
                <PieChartIcon className="h-4 w-4 mr-2 text-primary/70" />
                Most Read Categories
              </h3>

              {categoryData.length > 0 ? (
                <div className="h-64 flex items-center">
                  <CategoryPieChart
                    categoryData={categoryData}
                    customTooltipStyle={customTooltipStyle}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <PieChartIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>Not enough data to show categories</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Time of Day Distribution */}
          <Card className="p-4 rounded-2xl">
            <h3 className="text-sm font-medium mb-4 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary/70" />
              Reading by Time of Day
            </h3>

            <div className="h-64">
              <TimeOfTheData
                timeOfDayData={timeOfDayData}
                customTooltipStyle={customTooltipStyle}
              />
            </div>
          </Card>
        </div>
      </div>
    );
  }
);

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

interface TimeOfTheDataProps {
  timeOfDayData: { name: string; count: number; color: string }[];
  customTooltipStyle: {
    background: string;
    border: string;
    borderRadius: string;
    color: string;
  };
}
const TimeOfTheData = ({
  timeOfDayData,
  customTooltipStyle,
}: TimeOfTheDataProps) => {
  const { currentTheme } = useTheme();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={timeOfDayData}
        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
      >
        <XAxis
          dataKey="name"
          tick={{ fill: currentTheme.foreground + "80" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: currentTheme.foreground + "80" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <RechartsTooltip
          cursor={{ fill: currentTheme.primary + "10" }}
          contentStyle={customTooltipStyle}
          formatter={(value) => [`${value} documents`, "Read"]}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {timeOfDayData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

interface ReadingByWeekDayProps {
  weekdayData: { name: string; count: number }[];
  customTooltipStyle: {
    background: string;
    border: string;
    borderRadius: string;
    color: string;
  };
}
/**
 * 🌞 TimeOfTheData Component
 *
 * This delightful component visualizes reading patterns based on the time of day!
 * It creates a beautiful bar chart that helps users understand when they are most
 * active in their reading habits. 📚✨
 *
 * The chart is responsive and adapts to different screen sizes, ensuring a great
 * experience whether on mobile or desktop. It uses vibrant colors to represent
 * different time slots, making it visually appealing and easy to interpret. 🎨
 *
 * The component also includes a tooltip that provides additional context when
 * users hover over the bars, enhancing the interactivity and user engagement.
 * The tooltip displays the number of documents read during that time, giving
 * users a clear insight into their reading behavior. 🧐
 *
 * Overall, this component is designed to make data visualization fun and
 * informative, helping users to discover their reading habits in a charming way!
 */
const ReadingByWeekDay: React.FC<ReadingByWeekDayProps> = ({
  weekdayData,
  customTooltipStyle,
}) => {
  const { currentTheme } = useTheme();
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={weekdayData}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <XAxis
            dataKey="name"
            tick={{
              fill: currentTheme.foreground + "80",
              fontSize: 10,
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{
              fill: currentTheme.foreground + "80",
              fontSize: 10,
            }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={25}
          />
          <RechartsTooltip
            cursor={{ fill: currentTheme.primary + "10" }}
            contentStyle={customTooltipStyle}
            formatter={(value) => [`${value} documents`, "Read"]}
          />
          <Bar
            dataKey="count"
            fill={currentTheme.primary}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CategoryPieChartProps {
  categoryData: { name: string; count: number }[];
  customTooltipStyle: {
    background: string;
    border: string;
    borderRadius: string;
    color: string;
  };
}
/**
 * 🎉 CategoryPieChart
 *
 * This delightful component visualizes the distribution of reading categories
 * in a fun and engaging pie chart! 🥧✨
 *
 * It takes in a collection of categories and their respective counts,
 * transforming them into a colorful pie chart that makes it easy to see
 * which categories are most popular among readers. 📚❤️
 *
 * The chart is interactive and provides tooltips that show the exact
 * number of documents in each category when hovered over.
 * This way, users can quickly grasp their reading habits at a glance! 👀
 *
 * The pie chart is designed to be responsive, ensuring it looks great
 * on any device, whether it's a phone or a desktop. 📱💻
 *
 * Each slice of the pie is color-coded for clarity, making it visually
 * appealing and easy to understand. 🌈
 */
const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  categoryData,
  customTooltipStyle,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={70}
          paddingAngle={5}
          dataKey="count"
          stroke="transparent"
          label={({ name, percent }) =>
            `${name.substring(0, 8)}${name.length > 8 ? ".." : ""} (${(
              percent * 100
            ).toFixed(0)}%)`
          }
          labelLine={false}
        >
          {categoryData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip
          contentStyle={customTooltipStyle}
          formatter={(value, name) => [`${value} documents`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

interface MonthlyReadingTrendProps {
  monthlyData: { name: string; count: number }[];
  customTooltipStyle: {
    background: string;
    border: string;
    borderRadius: string;
    color: string;
  };
}
/**
 * 📊 MonthlyReadingTrend
 *
 * This component visualizes the user's monthly reading data in a beautiful bar chart!
 * It helps users track their reading progress over time, making it easy to see
 * how many documents they've read each month. 📅✨
 *
 * The chart is designed to be responsive, ensuring it looks great on any device,
 * whether it's a phone or a desktop. 📱💻
 *
 * Each bar represents the count of documents read in a specific month,
 * allowing users to quickly grasp their reading habits. 📈
 *
 * The tooltip provides additional context, showing the exact number of documents
 * read when hovering over a bar, making the data even more accessible! 🧐
 */
const MonthlyReadingTrend: React.FC<MonthlyReadingTrendProps> = ({
  monthlyData,
  customTooltipStyle,
}) => {
  const { currentTheme } = useTheme();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={monthlyData}
        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
      >
        <XAxis
          dataKey="name"
          tick={{
            fill: currentTheme.foreground + "80",
            fontSize: 10,
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{
            fill: currentTheme.foreground + "80",
            fontSize: 10,
          }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={25}
        />
        <RechartsTooltip
          cursor={{ fill: currentTheme.primary + "10" }}
          contentStyle={customTooltipStyle}
          formatter={(value) => [`${value} documents`, "Read"]}
        />
        <Bar
          dataKey="count"
          fill={currentTheme.primary}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HistoryTrends;
