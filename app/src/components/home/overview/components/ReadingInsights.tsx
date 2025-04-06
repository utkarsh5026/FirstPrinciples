import React from "react";
import { Brain, Calendar, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/components/theme/context/ThemeContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

interface ReadingInsightsProps {
  categoryData: { name: string; value: number }[];
  weekdayData: { name: string; count: number }[];
  mostReadCategory: string;
  COLORS: string[];
}

const ReadingInsights: React.FC<ReadingInsightsProps> = ({
  categoryData,
  weekdayData,
  mostReadCategory,
  COLORS,
}) => {
  const { currentTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Category breakdown */}
      <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-30"></div>

        <div className="relative">
          <div className="text-xs text-muted-foreground mb-2 flex items-center">
            <Brain className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
            Categories
          </div>

          {categoryData.length > 0 ? (
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="transparent"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [`${value} docs`, name]}
                    contentStyle={{
                      background: currentTheme.cardBg,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: "4px",
                      color: currentTheme.foreground,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-center">
              <div className="text-muted-foreground text-xs">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>
                  Read more documents
                  <br />
                  to see patterns
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-center text-muted-foreground mt-1">
            Most read:{" "}
            <span className="font-medium text-primary/90">
              {mostReadCategory}
            </span>
          </div>
        </div>
      </Card>

      {/* Weekly pattern */}
      <Card className="relative p-4 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-30"></div>

        <div className="relative">
          <div className="text-xs text-muted-foreground mb-2 flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
            Weekly Pattern
          </div>

          {weekdayData.some((day) => day.count > 0) ? (
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weekdayData}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    fontSize={10}
                    tick={{ fill: currentTheme.foreground + "80" }}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${value} docs`, "Read"]}
                    contentStyle={{
                      background: currentTheme.cardBg,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: "4px",
                      color: currentTheme.foreground,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill={currentTheme.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-center">
              <div className="text-muted-foreground text-xs">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>
                  Read more to see
                  <br />
                  your weekly patterns
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-center text-muted-foreground mt-1">
            {weekdayData.some((day) => day.count > 0) ? (
              <span>
                Best day:{" "}
                <span className="font-medium text-primary/90">
                  {
                    weekdayData.reduce((prev, current) =>
                      prev.count > current.count ? prev : current
                    ).name
                  }
                </span>
              </span>
            ) : (
              <span>Track your reading patterns</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReadingInsights;
