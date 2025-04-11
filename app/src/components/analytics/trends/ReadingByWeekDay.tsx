import { useTheme } from "@/components/theme/context/ThemeContext";
import { useReadingMetrics } from "@/context";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

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
const ReadingByWeekDay: React.FC = () => {
  const { currentTheme } = useTheme();
  const { analyticsData } = useReadingMetrics();

  const customTooltipStyle = {
    background: currentTheme.cardBg || "#ffffff",
    border: `1px solid ${currentTheme.border}`,
    borderRadius: "4px",
    color: currentTheme.foreground,
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={analyticsData.weeklyActivity}
        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
      >
        <XAxis
          dataKey={(item) => item.day.slice(0, 3)}
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

export default ReadingByWeekDay;
