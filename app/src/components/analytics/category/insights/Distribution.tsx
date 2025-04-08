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
} from "recharts";
import { COLORS } from "../../utils";
import { Filter, BarChart } from "lucide-react";

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
}

const Distribution = ({
  selectedSubcategory,
  selectedCategory,
  distributionData,
  onSelectDocument,
}: DistributionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bar chart distribution */}
      <div className="border rounded-lg p-4 h-[500px]">
        <h5 className="text-xs uppercase text-muted-foreground font-medium mb-3">
          {selectedSubcategory
            ? "Document Distribution"
            : selectedCategory
            ? "Subcategory Distribution"
            : "Category Distribution"}
        </h5>

        {distributionData.length > 0 ? (
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={distributionData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <RechartsTooltip
                  formatter={(
                    value: number,
                    _name: string,
                    props: {
                      payload?: {
                        name: string;
                        value: number;
                        full?: string;
                        totalDocuments?: number;
                      };
                    }
                  ) => {
                    const item = props.payload;
                    return item?.full
                      ? [`${value} reads`, item.full]
                      : [`${value} documents read`, item?.name || "Unknown"];
                  }}
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    border: "1px solid #333",
                    borderRadius: "4px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  onClick={(data) => {
                    if (data.path) {
                      onSelectDocument(data.path, data.fullName || data.name);
                    }
                  }}
                  cursor={selectedSubcategory ? "pointer" : "default"}
                />
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

        {distributionData.length > 0 ? (
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData.map((item) => ({
                    name: item.name,
                    value: item.count,
                    full: "fullName" in item ? item.fullName : undefined,
                    path: "path" in item ? item.path : undefined,
                    totalDocuments:
                      "totalDocuments" in item
                        ? item.totalDocuments
                        : undefined,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: "var(--primary)", strokeWidth: 1 }}
                >
                  {distributionData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="rgba(0, 0, 0, 0.1)"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(
                    value: number,
                    _name: string,
                    props: {
                      payload?: {
                        name: string;
                        value: number;
                        full?: string;
                        totalDocuments?: number;
                      };
                    }
                  ) => {
                    const item = props.payload;
                    return [
                      `${value} reads${
                        item?.totalDocuments
                          ? ` (${Math.round(
                              (value / item.totalDocuments) * 100
                            )}%)`
                          : ""
                      }`,
                      item?.full ?? item?.name ?? "Unknown",
                    ];
                  }}
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    border: "1px solid #333",
                    borderRadius: "4px",
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

export default Distribution;
