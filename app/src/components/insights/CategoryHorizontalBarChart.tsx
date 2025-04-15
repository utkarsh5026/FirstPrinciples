import {
  Cell,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import useMobile from "@/hooks/useMobile";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { COLORS } from "@/lib/constants";

type CateggoryBarData = {
  name: string;
  displayName: string;
  count: number;
  totalDocuments: number;
  percentage: number;
  fill: string;
  path: string;
};

const CategoryHorizontalBarChart = ({
  data,
  onSelectDocument,
  selectedSubcategory,
}: {
  data: CateggoryBarData[];
  onSelectDocument: (path: string, name: string) => void;
  selectedSubcategory: string | null;
}) => {
  const { isMobile } = useMobile();
  const { currentTheme } = useTheme();

  const customTooltipStyle = {
    backgroundColor: currentTheme.cardBg,
    border: `1px solid ${currentTheme.border}`,
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: isMobile ? "12px" : "14px",
    boxShadow: `0 4px 12px ${currentTheme.background}80`,
  };

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <RechartsBarChart
        data={data}
        layout="vertical"
        margin={{
          top: 5,
          right: isMobile ? 5 : 30,
          left: isMobile ? 10 : 20,
          bottom: 30,
        }}
        barSize={isMobile ? 18 : 24}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis
          type="number"
          tick={{
            fontSize: isMobile ? 10 : 12,
            fill: currentTheme.foreground,
          }}
          tickMargin={8}
          axisLine={{ stroke: currentTheme.border, opacity: 0.3 }}
          tickLine={{ stroke: currentTheme.border, opacity: 0.3 }}
        />
        <YAxis
          type="category"
          dataKey="displayName"
          width={isMobile ? 80 : 140}
          tick={{
            fontSize: isMobile ? 10 : 12,
            fill: currentTheme.foreground,
          }}
          tickMargin={8}
          axisLine={{ stroke: currentTheme.border, opacity: 0.3 }}
          tickLine={{ stroke: currentTheme.border, opacity: 0.3 }}
        />
        <RechartsTooltip
          content={({ active, payload }) => {
            if (active && payload?.length) {
              const data = payload[0].payload;
              const tooltipName = data.fullName || data.name;
              let tooltipValue = `${data.count} reads`;

              if ("totalDocuments" in data) {
                const percentage = Math.round(
                  (data.count / data.totalDocuments) * 100
                );
                tooltipValue = `${data.count} of ${data.totalDocuments} (${percentage}%)`;
              }

              return (
                <div style={customTooltipStyle}>
                  <p className="font-medium text-sm mb-1">{tooltipName}</p>
                  <p className="text-muted-foreground text-xs">
                    {tooltipValue}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar
          dataKey="count"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={(data: any) => {
            if (data.path && typeof data.path === "string") {
              onSelectDocument(data.path, data.fullName || data.name);
            }
          }}
          isAnimationActive={true}
          animationDuration={600}
          cursor={selectedSubcategory ? "pointer" : "default"}
          label={
            isMobile
              ? false
              : {
                  position: "right",
                  offset: 5,
                  fontSize: 11,
                  fill: currentTheme.foreground,
                  opacity: 0.7,
                  formatter: (value: number) => (value > 0 ? value : ""),
                }
          }
        >
          {data.map((entry, index) => (
            <Cell
              key={`${entry.name}-${index}`}
              fill={entry.fill || COLORS[index % COLORS.length]}
              className="transition-opacity duration-200 hover:opacity-80"
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default CategoryHorizontalBarChart;
