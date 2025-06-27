import { BookMarked, Calendar, BarChart, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useReadingHistory } from "@/hooks";
import { useMemo } from "react";
import ReadingItem from "./reading-item";
import {
  CategoryDistribution,
  TimeOfTheDayDistribution,
} from "@/components/shared/visualizations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TodayReadingProps {
  onFileSelect: (path: string) => void;
}

const TodayReading: React.FC<TodayReadingProps> = ({ onFileSelect }) => {
  const { history } = useReadingHistory();

  const todayHistory = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return history
      .filter((item) => {
        const itemDate = new Date(item.lastReadAt);
        return itemDate >= today;
      })
      .sort((a, b) => b.lastReadAt - a.lastReadAt);
  }, [history]);

  return (
    <div className="px-4 pb-6">
      {todayHistory.length > 0 ? (
        <Tabs defaultValue="history" className="w-full">
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-sm text-muted-foreground">
              <span className="font-bold text-primary">
                {todayHistory.length}
              </span>{" "}
              documents read today
            </span>
            <TabsList>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock size={16} />
              </TabsTrigger>
              <TabsTrigger
                value="visualizations"
                className="flex items-center gap-2"
              >
                <BarChart size={16} />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="history"
            className="space-y-4 w-full flex flex-col gap-4 px-4"
          >
            {todayHistory.map((item) => (
              <ReadingItem
                item={item}
                onFileSelect={onFileSelect}
                key={item.id}
              />
            ))}
          </TabsContent>

          <TabsContent
            value="visualizations"
            className="flex flex-col gap-4 px-4"
          >
            <CategoryDistribution history={todayHistory} compact />
            <TimeOfTheDayDistribution
              history={todayHistory}
              compact
              typeOfChart="area"
            />
            <TimeOfTheDayDistribution
              history={todayHistory}
              compact
              typeOfChart="bar"
            />
          </TabsContent>
        </Tabs>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border/20 shadow-sm rounded-xl p-6 text-center"
        >
          <div className="bg-primary/5 p-3 rounded-full inline-block mb-3">
            <Calendar size={28} className="text-primary" />
          </div>
          <h4 className="text-sm font-medium mb-2">No Activity Today</h4>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-3">
            You haven't read any documents today.
          </p>
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
            <BookMarked size={12} className="mr-1.5" />
            Start reading to track your progress
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TodayReading;
