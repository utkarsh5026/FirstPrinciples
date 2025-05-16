import { BookMarked, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useReadingHistory } from "@/hooks";
import { useMemo } from "react";
import ReadingItem from "./ReadingItem";

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
        <div className="flex flex-col gap-4 overflow-auto scrollbar-hide">
          {todayHistory.map((item) => (
            <ReadingItem
              item={item}
              onFileSelect={onFileSelect}
              key={item.id}
            />
          ))}
        </div>
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
