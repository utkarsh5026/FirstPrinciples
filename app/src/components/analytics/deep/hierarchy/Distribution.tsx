import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Tooltip as RechartsTooltip,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  PieChart as PieChartIcon,
  ChevronUp,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import useMobile from "@/hooks/useMobile";
import CategoryHorizontalBarChart from "@/components/insights/CategoryHorizontalBarChart";

interface DistributionProps {
  selectedSubcategory: string | null;
  selectedCategory: string | null;
  distributionData:
    | {
        name: string;
        fullName: string;
        count: number;
        path: string;
      }[]
    | {
        name: string;
        count: number;
        totalDocuments: number;
        percentage: number;
      }[];
  onSelectDocument: (path: string, title: string) => void;
  isMobile?: boolean;
}

/**
 * Enhanced Distribution component that displays category distribution with:
 * - Interactive pie chart with animations
 * - Dynamic bar chart with sorting options
 * - Responsive design for mobile and desktop
 * - Visual enhancements for better readability
 */
const EnhancedDistribution: React.FC<DistributionProps> = ({
  selectedSubcategory,
  selectedCategory,
  distributionData,
  onSelectDocument,
  isMobile = false,
}) => {
  const { currentTheme } = useTheme();
  const { isMobile: isMobileView } = useMobile();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");
  const [sortBy, setSortBy] = useState<"value" | "alphabetical">("value");

  // Get the title for the current view
  const getViewTitle = () => {
    if (selectedSubcategory) return "Document Distribution";
    if (selectedCategory) return "Subcategory Distribution";
    return "Category Distribution";
  };

  // Truncate long names for better display
  const processedData = distributionData.map((item, index) => ({
    ...item,
    displayName:
      item.name.length > (isMobile ? 12 : 20)
        ? item.name.substring(0, isMobile ? 10 : 18) + "..."
        : item.name,
    fill: COLORS[index % COLORS.length],
  }));

  // Sort data based on selected sort method
  const sortedData = React.useMemo(() => {
    if (sortBy === "alphabetical") {
      return [...processedData].sort((a, b) => a.name.localeCompare(b.name));
    }
    return [...processedData].sort((a, b) => b.count - a.count);
  }, [processedData, sortBy]);

  // Empty state check
  const hasData = distributionData.length > 0;

  // Pie chart custom active shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;

    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke={currentTheme.background}
          strokeWidth={2}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
          stroke={currentTheme.background}
          strokeWidth={1}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
          strokeWidth={2}
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill={fill}
          fontSize={12}
        >
          {payload.displayName}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#999"
          fontSize={11}
        >
          {`${value} (${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  // Custom tooltip styles
  const customTooltipStyle = {
    backgroundColor: currentTheme.cardBg,
    border: `1px solid ${currentTheme.border}`,
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: isMobile ? "12px" : "14px",
    boxShadow: `0 4px 12px ${currentTheme.background}80`,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Chart type toggle buttons */}
      <div className="md:col-span-2 flex justify-between items-center mb-1">
        <h4 className="text-sm font-medium">{getViewTitle()}</h4>

        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === "value" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setSortBy("value")}
          >
            <BarChart className="h-3.5 w-3.5 mr-1.5" />
            Sort by Count
          </Button>
          <Button
            variant={sortBy === "alphabetical" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setSortBy("alphabetical")}
          >
            {sortBy === "alphabetical" ? (
              <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5 mr-1.5" />
            )}
            Alphabetical
          </Button>

          <div className="border-l border-border/40 h-6 mx-1"></div>

          <div className="flex bg-card rounded-md p-0.5 border border-border/30">
            <Button
              variant={chartType === "pie" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setChartType("pie")}
            >
              <PieChartIcon className="h-4 w-4" />
              <span className="sr-only">Pie Chart</span>
            </Button>
            <Button
              variant={chartType === "bar" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setChartType("bar")}
            >
              <BarChart className="h-4 w-4" />
              <span className="sr-only">Bar Chart</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Charts container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={chartType}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "border rounded-lg p-4 bg-card/30",
            chartType === "pie"
              ? "md:col-span-2 h-[550px]"
              : "col-span-full md:col-span-2 h-[500px]"
          )}
        >
          {hasData ? (
            chartType === "pie" ? (
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%" debounce={50}>
                    <PieChart>
                      <Pie
                        activeIndex={
                          activeIndex !== null ? activeIndex : undefined
                        }
                        activeShape={renderActiveShape}
                        data={sortedData}
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobileView ? 50 : 80}
                        outerRadius={isMobileView ? 80 : 110}
                        paddingAngle={2}
                        dataKey="count"
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onClick={(data: any) => {
                          if (data.path && typeof data.path === "string") {
                            onSelectDocument(
                              data.path,
                              data.fullName || data.name
                            );
                          }
                        }}
                      >
                        {sortedData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill || COLORS[index % COLORS.length]}
                            stroke={currentTheme.background}
                            strokeWidth={2}
                            className="transition-opacity duration-200 hover:opacity-80"
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        content={(props) => {
                          if (
                            props.active &&
                            props.payload &&
                            props.payload.length
                          ) {
                            const data = props.payload[0].payload;
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
                                <p className="font-medium text-sm mb-1">
                                  {tooltipName}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {tooltipValue}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="mt-2 pt-2 border-t border-border/30">
                  <ScrollArea className="h-24 overflow-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 px-1">
                      {sortedData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center text-xs group cursor-pointer"
                          onMouseEnter={() => setActiveIndex(index)}
                          onMouseLeave={() => setActiveIndex(null)}
                          onClick={() => {
                            if ("path" in item && item.path) {
                              onSelectDocument(
                                item.path,
                                item.fullName || item.name
                              );
                            }
                          }}
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                            style={{
                              backgroundColor:
                                item.fill || COLORS[index % COLORS.length],
                            }}
                          />
                          <div className="truncate group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="ml-1 text-muted-foreground">
                            ({item.count})
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <CategoryHorizontalBarChart
                  data={sortedData.map((item) => ({
                    ...item,
                    totalDocuments: item.count || 0,
                    percentage: item.count || 0,
                    path: item.name || "",
                  }))}
                  onSelectDocument={onSelectDocument}
                  selectedSubcategory={selectedSubcategory}
                />
              </div>
            )
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="mx-auto mb-3 relative w-12 h-12"
                >
                  {chartType === "pie" ? (
                    <PieChartIcon className="h-12 w-12 opacity-25 absolute inset-0" />
                  ) : (
                    <BarChart className="h-12 w-12 opacity-25 absolute inset-0" />
                  )}
                  <RefreshCw className="h-5 w-5 text-primary/50 absolute -right-1 -top-1" />
                </motion.div>
                <p className="text-base mb-1">No data to visualize</p>
                <p className="text-sm text-muted-foreground/70">
                  Read more documents to see distribution charts
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EnhancedDistribution;
