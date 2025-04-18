import React, { memo, useMemo } from "react";
import { PieChart as RechartsPieChart, Pie, Cell, Sector } from "recharts";
import useMobile from "@/hooks/useMobile";
import { BookText } from "lucide-react";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { motion } from "framer-motion";
import { CategoryBreakdown } from "@/stores/categoryStore";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import getIconForTech from "../icons";
import { cn } from "@/lib/utils";
import { generateThemeColors } from "@/utils/colors";
import { fromSnakeToTitleCase, truncateText } from "@/utils/string";

interface CategoryPieChartProps {
  descriptive?: boolean;
  categoryBreakdown: CategoryBreakdown[];
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = memo(
  ({ descriptive = true, categoryBreakdown }) => {
    const { isMobile } = useMobile();

    const { currentTheme } = useTheme();

    const chartThemeColors = useMemo(() => {
      const baseColor = currentTheme.primary;
      return generateThemeColors(baseColor, categoryBreakdown.length);
    }, [currentTheme, categoryBreakdown]);

    const total = useMemo(() => {
      return categoryBreakdown.reduce((acc, curr) => acc + curr.count, 0);
    }, [categoryBreakdown]);

    const descriptiveActiveShape = (props: PieSectorDataItem) => {
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
        percent,
      } = props;

      console.log(props.payload);

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
          <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
            {payload.name}
          </text>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
          <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={outerRadius + 6}
            outerRadius={outerRadius + 10}
            fill={fill}
          />
          <path
            d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
            stroke={fill}
            fill="none"
          />
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
          <text
            x={ex + (cos >= 0 ? 1 : -1) * 12}
            y={ey}
            textAnchor={textAnchor}
            fillOpacity={0.8}
            fill={currentTheme.foreground}
          >{`${truncateText(fromSnakeToTitleCase(payload.category), 15)} (${
            payload.count
          }/${total})`}</text>

          <text
            x={ex + (cos >= 0 ? 1 : -1) * 12}
            y={ey}
            dy={18}
            textAnchor={textAnchor}
            fill={currentTheme.foreground}
            fillOpacity={0.6}
          >
            {`(Rate ${(percent ?? 0 * 100).toFixed(2)}%)`}
          </text>
        </g>
      );
    };

    const simpleActiveShape = (props: PieSectorDataItem) => {
      const { outerRadius = 0 } = props;
      return <Sector {...props} outerRadius={outerRadius + 5} />;
    };

    if (categoryBreakdown.length === 0) {
      return (
        <motion.div
          className="h-full flex items-center justify-center flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <BookText className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
          <p className="text-sm text-muted-foreground">No category data yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Read more documents to see insights
          </p>
        </motion.div>
      );
    }

    const config: ChartConfig = {
      category: {
        label: "Category",
      },
    };

    return (
      <ChartContainer className="w-full h-full" config={config}>
        <RechartsPieChart>
          {descriptive && <ChartLegend />}
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name) => {
                  const category = config[name as keyof typeof config];
                  const CategoryIcon = getIconForTech(name as string);
                  return (
                    <div
                      className={cn(
                        "flex items-center text-xs text-muted-foreground gap-2 justify-between"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-4 h-4 text-primary" />
                        {category?.label || name}
                      </div>
                      <div className="items-baseline gap-0.5 font-cascadia-code font-medium tabular-nums text-foreground">
                        {`${value}%`}
                      </div>
                    </div>
                  );
                }}
              />
            }
            cursor={false}
            defaultIndex={1}
          />
          <Pie
            data={categoryBreakdown}
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? "40%" : "45%"}
            outerRadius={isMobile ? "70%" : "75%"}
            paddingAngle={4}
            dataKey="percentage"
            nameKey="category"
            isAnimationActive={true}
            activeShape={
              descriptive ? descriptiveActiveShape : simpleActiveShape
            }
            activeIndex={0}
          >
            {categoryBreakdown.map(({ category }, index) => (
              <Cell
                key={`${category}`}
                fill={chartThemeColors[index % chartThemeColors.length]}
                style={{
                  filter: "brightness(1.1)",
                  transition: "filter 0.3s ease",
                  cursor: "pointer",
                }}
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </ChartContainer>
    );
  }
);

export default CategoryPieChart;
