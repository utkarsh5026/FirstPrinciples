import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { useTheme } from "@/components/features/theme/hooks/use-theme";
import { truncateText, fromSnakeToTitleCase } from "@/utils/string";
import type { CategoryBreakdown } from "@/stores/analytics/category-store";
import { Sector } from "recharts";

const ActivePieShape = (props: PieSectorDataItem) => {
  const { currentTheme } = useTheme();
  const RADIAN = Math.PI / 180;
  const {
    cx = 0,
    cy = 0,
    midAngle,
    innerRadius = 0,
    outerRadius = 0,
    startAngle,
    endAngle,
    fill,
    payload,
  } = props;

  // Extract data from payload
  const data = payload as CategoryBreakdown & { name: string };

  const sin = Math.sin(-RADIAN * (midAngle ?? 0));
  const cos = Math.cos(-RADIAN * (midAngle ?? 0));
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      {/* Inner sector */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />

      {/* Outer highlight sector */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />

      {/* Connecting line and dot */}
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />

      {/* Category name and count */}
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill={currentTheme.foreground}
        fontSize={12}
        fontWeight="bold"
      >
        {truncateText(fromSnakeToTitleCase(data.category), 15)}
      </text>

      {/* Percentage and count */}
    </g>
  );
};

export default ActivePieShape;
