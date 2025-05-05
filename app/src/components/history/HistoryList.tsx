import { ReadingHistoryItem } from "@/services/reading/reading-history-service";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import getIconForTech from "@/components/shared/icons/iconMap";
import { fromSnakeToTitleCase } from "@/utils/string";
import { formatDate } from "@/components/home/utils";

interface HistoryListProps {
  filteredHistory: ReadingHistoryItem[];
  handleSelectDocument: (path: string, title: string) => void;
}

/**
 * Minimalist History List Component
 */
const HistoryList: React.FC<HistoryListProps> = ({
  filteredHistory,
  handleSelectDocument,
}) => {
  return (
    <div className="space-y-2">
      {filteredHistory.map((item) => {
        const category = item.path.split("/")[0] || "uncategorized";
        const CategoryIcon = getIconForTech(category);
        const title = fromSnakeToTitleCase(
          item.path.split("/").pop()?.replace(".md", "") ?? ""
        );

        // Calculate how recent the read was
        const isRecent = Date.now() - item.lastReadAt < 24 * 60 * 60 * 1000;

        return (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -1, transition: { duration: 0.2 } }}
            className="border border-primary/10 hover:border-primary/30 hover:bg-primary/5 rounded-2xl p-3 cursor-pointer transition-colors"
            onClick={() => handleSelectDocument(item.path, item.title)}
          >
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                <CategoryIcon className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm truncate">{title}</h4>
                <div className="flex items-center text-xs text-muted-foreground mt-1 flex-wrap gap-x-3">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(item.lastReadAt)}
                  </span>
                  <Badge className="text-[10px] h-4 bg-primary/10 text-primary/80 hover:bg-primary/20 rounded-full">
                    {fromSnakeToTitleCase(category)}
                  </Badge>
                </div>
              </div>

              {isRecent && (
                <div className="ml-2 w-2 h-2 rounded-full bg-green-500" />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default HistoryList;
