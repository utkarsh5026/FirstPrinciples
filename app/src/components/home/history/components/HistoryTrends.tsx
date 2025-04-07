import React, { memo, useState } from "react";
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

const HistoryTrends: React.FC<HistoryTrendsProps> = memo(
  ({ readingHistory, monthlyData, currentTheme }) => {
    const [openSection, setOpenSection] = useState<string>("monthly");

    // Generate weekday distribution data
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
      // Convert from 0-6 (Sunday-Saturday) to weekdays array index
      const index = day === 0 ? 6 : day - 1;
      weekdayData[index].count++;
    });

    // Generate time of day distribution
    const timeOfDayData = [
      { name: "Morning", count: 0, color: "#FFB347" },
      { name: "Afternoon", count: 0, color: "#FFD700" },
      { name: "Evening", count: 0, color: "#9370DB" },
      { name: "Night", count: 0, color: "#6A5ACD" },
    ];

    readingHistory.forEach((item) => {
      const hour = new Date(item.lastReadAt).getHours();

      if (hour >= 5 && hour < 12) {
        timeOfDayData[0].count++;
      } else if (hour >= 12 && hour < 17) {
        timeOfDayData[1].count++;
      } else if (hour >= 17 && hour < 21) {
        timeOfDayData[2].count++;
      } else {
        timeOfDayData[3].count++;
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

    // Generate chart colors based on theme
    const generateChartColors = () => {
      return [
        currentTheme.primary,
        `${currentTheme.primary}DD`,
        `${currentTheme.primary}BB`,
        `${currentTheme.primary}99`,
        `${currentTheme.primary}77`,
      ];
    };

    const COLORS = generateChartColors();

    const customTooltipStyle = {
      background: currentTheme.cardBg || "#ffffff",
      border: `1px solid ${currentTheme.border}`,
      borderRadius: "4px",
      color: currentTheme.foreground,
    };

    // Mobile UI with collapsible sections
    const ChartSection = ({
      id,
      title,
      icon,
      children,
    }: {
      id: string;
      title: string;
      icon: React.ReactNode;
      children: React.ReactNode;
    }) => (
      <Card className="p-3 md:p-4 mb-4">
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

    return (
      <div className="space-y-2 md:space-y-6">
        {/* For mobile: collapsible charts */}
        <div className="md:hidden">
          <ChartSection
            id="monthly"
            title="Monthly Reading Trend"
            icon={<TrendingUp className="h-4 w-4 mr-2 text-primary/70" />}
          >
            <div className="h-56">
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
            </div>
          </ChartSection>

          <ChartSection
            id="weekday"
            title="Reading by Day of Week"
            icon={<BarChart2 className="h-4 w-4 mr-2 text-primary/70" />}
          >
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
          </ChartSection>

          <ChartSection
            id="categories"
            title="Most Read Categories"
            icon={<PieChartIcon className="h-4 w-4 mr-2 text-primary/70" />}
          >
            {categoryData.length > 0 ? (
              <div className="h-56 flex items-center">
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
                        `${name.substring(0, 8)}${
                          name.length > 8 ? ".." : ""
                        } (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={customTooltipStyle}
                      formatter={(value, name) => [`${value} documents`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <PieChartIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Not enough data to show categories</p>
                </div>
              </div>
            )}
          </ChartSection>

          <ChartSection
            id="timeOfDay"
            title="Reading by Time of Day"
            icon={<Clock className="h-4 w-4 mr-2 text-primary/70" />}
          >
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeOfDayData}
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
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {timeOfDayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartSection>
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
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
                  <Bar
                    dataKey="count"
                    fill={currentTheme.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weekdayData}
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
                    <Bar
                      dataKey="count"
                      fill={currentTheme.primary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
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
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        stroke="transparent"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelLine={false}
                      >
                        {categoryData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={customTooltipStyle}
                        formatter={(value, name) => [
                          `${value} documents`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
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
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-4 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary/70" />
              Reading by Time of Day
            </h3>

            <div className="h-64">
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
            </div>
          </Card>
        </div>
      </div>
    );
  }
);

export default HistoryTrends;
