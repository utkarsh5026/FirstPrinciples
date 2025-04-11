import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LineChart } from "lucide-react";
import { useState } from "react";
import MonthlyReadingTrend from "../trends/MonthlyTrend";
import WeekilyPattern from "../insights/WeeklyPattern";

type Period = "week" | "month" | "all";

const ReadingTrends: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("week");
  return (
    <Card className="p-4 border-primary/10 rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium flex items-center">
          <LineChart className="h-4 w-4 mr-2 text-primary" />
          Reading Trends
        </h4>
        <div className="flex bg-secondary/20 rounded-lg p-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs rounded-md",
              selectedPeriod === "week" && "bg-card"
            )}
            onClick={() => setSelectedPeriod("week")}
          >
            Week
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs rounded-md",
              selectedPeriod === "month" && "bg-card"
            )}
            onClick={() => setSelectedPeriod("month")}
          >
            Month
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs rounded-md",
              selectedPeriod === "all" && "bg-card"
            )}
            onClick={() => setSelectedPeriod("all")}
          >
            All
          </Button>
        </div>
      </div>

      <div className="h-52">
        {selectedPeriod === "month" && <MonthlyReadingTrend />}
        {selectedPeriod === "week" && <WeekilyPattern />}
      </div>
    </Card>
  );
};

export default ReadingTrends;
