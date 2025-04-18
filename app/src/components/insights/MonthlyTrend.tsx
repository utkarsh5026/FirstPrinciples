import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { useActivityStore } from "@/stores";

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
const MonthlyReadingTrend: React.FC = () => {
  const { currentTheme } = useTheme();
  const monthlyData = useActivityStore((state) => state.totalDailyActivity);

  const customTooltipStyle = {
    background: currentTheme.cardBg || "#ffffff",
    border: `1px solid ${currentTheme.border}`,
    borderRadius: "4px",
    color: currentTheme.foreground,
  };

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

export default MonthlyReadingTrend;
