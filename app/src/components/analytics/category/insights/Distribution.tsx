import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Filter, BarChart } from "lucide-react";

// Define the COLORS array for the charts
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

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
 * Enhanced Distribution component that displays category distribution in two charts:
 * 1. A bar chart showing the distribution of documents/categories
 * 2. A pie chart showing reading completion percentages
 *
 * This component improves on the original by:
 * - Adding responsive design for mobile and desktop
 * - Enhancing visual clarity of charts
 * - Improving label readability and truncation
 * - Adding smooth animations
 * - Properly handling empty data states
 */
const EnhancedDistribution: React.FC<DistributionProps> = ({
  selectedSubcategory,
  selectedCategory,
  distributionData,
  onSelectDocument,
  isMobile = false,
}) => {
  // Get the title for the current view
  const getViewTitle = () => {
    if (selectedSubcategory) return "Document Distribution";
    if (selectedCategory) return "Subcategory Distribution";
    return "Category Distribution";
  };

  // Truncate long names for better display
  const processedData = distributionData.map((item) => ({
    ...item,
    displayName:
      item.name.length > (isMobile ? 10 : 18)
        ? item.name.substring(0, isMobile ? 8 : 15) + "..."
        : item.name,
  }));

  // Empty state check
  const hasData = distributionData.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bar chart distribution */}
      <div className="border rounded-lg p-4 h-[500px]">
        <h5 className="text-xs uppercase text-muted-foreground font-medium mb-3">
          {getViewTitle()}
        </h5>

        {hasData ? (
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <RechartsBarChart
                data={processedData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: isMobile ? 5 : 30,
                  left: isMobile ? 10 : 20,
                  bottom: 5,
                }}
                barSize={isMobile ? 16 : 24}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  type="number"
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickMargin={8}
                  axisLine={{ stroke: "#333", strokeOpacity: 0.2 }}
                  tickLine={{ stroke: "#333", strokeOpacity: 0.2 }}
                />
                <YAxis
                  type="category"
                  dataKey="displayName"
                  width={isMobile ? 80 : 140}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickMargin={8}
                  axisLine={{ stroke: "#333", strokeOpacity: 0.2 }}
                  tickLine={{ stroke: "#333", strokeOpacity: 0.2 }}
                />
                <RechartsTooltip
                  formatter={(
                    value: number,
                    _name: string,
                    props: {
                      payload?: {
                        payload?: {
                          name: string;
                          fullName?: string;
                          value: number;
                          totalDocuments?: number;
                          path?: string;
                        };
                      };
                    }
                  ) => {
                    const item = props?.payload?.payload;
                    if (!item) return ["N/A", "Unknown"];

                    const tooltipName = item.fullName || item.name;
                    const tooltipValue = `${value} documents read`;

                    if (item.totalDocuments) {
                      return [
                        `${value} of ${item.totalDocuments} (${Math.round(
                          (value / item.totalDocuments) * 100
                        )}%)`,
                        tooltipName,
                      ];
                    }

                    return [tooltipValue, tooltipName];
                  }}
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    border: "1px solid #333",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  onClick={(data: any) => {
                    if (data.path && typeof data.path === "string") {
                      onSelectDocument(data.path, data.fullName || data.name);
                    }
                  }}
                  isAnimationActive={true}
                  animationDuration={500}
                  cursor={selectedSubcategory ? "pointer" : "default"}
                  label={
                    isMobile
                      ? undefined
                      : {
                          position: "right",
                          offset: 5,
                          fontSize: 11,
                          fill: "var(--muted-foreground)",
                          formatter: (value: number) =>
                            value > 0 ? value : "",
                        }
                  }
                >
                  {processedData.map((_data, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`var(--primary)`}
                      opacity={0.7 + (0.3 * index) / processedData.length}
                    />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BarChart className="h-10 w-10 mx-auto mb-2 opacity-25" />
              <p>No data to visualize</p>
            </div>
          </div>
        )}
      </div>

      {/* Pie chart distribution */}
      <div className="border rounded-lg p-4 h-[500px]">
        <h5 className="text-xs uppercase text-muted-foreground font-medium mb-3">
          Reading Completion
        </h5>

        {hasData ? (
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <PieChart>
                <Pie
                  data={processedData.map((item) => ({
                    name: item.displayName,
                    value: item.count,
                    full: "fullName" in item ? item.fullName : undefined,
                    path: "path" in item ? item.path : undefined,
                    totalDocuments:
                      "totalDocuments" in item
                        ? item.totalDocuments
                        : undefined,
                  }))}
                  cx="50%"
                  cy="45%"
                  innerRadius={isMobile ? 40 : 60}
                  outerRadius={isMobile ? 80 : 110}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{
                    stroke: "var(--primary)",
                    strokeWidth: 1,
                    strokeOpacity: 0.3,
                  }}
                  isAnimationActive={true}
                  animationDuration={800}
                  animationBegin={200}
                  onClick={(data: any) => {
                    if (data.path && typeof data.path === "string") {
                      onSelectDocument(data.path, data.full || data.name);
                    }
                  }}
                >
                  {processedData.map((_item, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="rgba(0, 0, 0, 0.1)"
                      strokeWidth={1}
                      className="transition-opacity duration-200 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(
                    value: number,
                    _name: string,
                    props: {
                      payload?: {
                        payload?: {
                          name: string;
                          value: number;
                          full?: string;
                          totalDocuments?: number;
                          path?: string;
                        };
                      };
                    }
                  ) => {
                    const item = props?.payload?.payload;
                    if (!item) return ["N/A", "Unknown"];

                    const tooltipName = item.full || item.name;
                    let tooltipValue = `${value} reads`;

                    if (item.totalDocuments) {
                      const percentage = Math.round(
                        (value / item.totalDocuments) * 100
                      );
                      tooltipValue = `${value} of ${item.totalDocuments} (${percentage}%)`;
                    }

                    return [tooltipValue, tooltipName];
                  }}
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    border: "1px solid #333",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    fontSize: isMobile ? 10 : 12,
                    bottom: 10,
                    color: "var(--foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Filter className="h-10 w-10 mx-auto mb-2 opacity-25" />
              <p>No data to visualize</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDistribution;
