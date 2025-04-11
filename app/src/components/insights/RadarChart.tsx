import React from "react";
import {
  Radar,
  RadarChart as RechartRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import useMobile from "@/hooks/useMobile";

type CategoryRadarData = {
  name: string;
  fullName?: string;
  value: number;
  totalValue: number;
  percentage: number;
  fillColor?: string;
};

interface RadarChartProps {
  chartData: CategoryRadarData[];
}

/**
 * 🎨 RadarChart is a delightful visualization component that showcases category coverage
 * in a radar format! It helps users easily understand their progress across different
 * categories at a glance. 🌟
 *
 * 📱 This component is responsive and adapts to mobile screens, ensuring a great
 * experience no matter the device!
 *
 * 🛠️ It utilizes hooks to determine the screen size and adjusts the chart's appearance
 * accordingly, making it user-friendly and accessible.
 *
 * 🧩 The chart displays various categories with their respective completion percentages,
 * providing insights into areas of strength and those needing attention.
 *
 * 💡 Tooltips enhance the user experience by offering detailed information on hover,
 * making data exploration fun and engaging!
 */
const RadarChart: React.FC<RadarChartProps> = ({ chartData }) => {
  const { isMobile } = useMobile();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartRadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid strokeDasharray="3 3" stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="name"
          tick={{
            fill: "var(--muted-foreground)",
            fontSize: isMobile ? 10 : 12,
          }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fill: "var(--muted-foreground)" }}
          tickCount={5}
          stroke="var(--border)"
        />
        <RechartsTooltip
          formatter={(
            value: number,
            _name: string,
            props: {
              payload?: {
                name: string;
                fullName?: string;
                value: number;
                totalValue: number;
              };
            }
          ) => {
            const item = props.payload;
            if (!item) return ["N/A", "Unknown"];
            return [
              `${Math.round(value)}% Complete (${item.value}/${
                item.totalValue
              })`,
              item.fullName ?? item.name,
            ];
          }}
          contentStyle={{
            backgroundColor: "rgba(22, 22, 22, 0.9)",
            border: "1px solid #333",
            borderRadius: "4px",
          }}
        />
        <Radar
          name="Coverage"
          dataKey="value"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.4}
          activeDot={{
            r: 8,
          }}
        />
      </RechartRadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChart;
