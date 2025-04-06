import { Sparkles, FileText, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ReadingHistoryItem, ReadingTodoItem } from "./types";
import type { FileMetadata } from "@/utils/MarkdownLoader";

interface HeroProps {
  availableDocuments: FileMetadata[];
  todoList: ReadingTodoItem[];
  readingHistory: ReadingHistoryItem[];
}

const Hero: React.FC<HeroProps> = ({
  availableDocuments,
  todoList,
  readingHistory,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/20 opacity-60"></div>

      <div className="relative z-10 px-6 py-8 md:py-10 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full mb-6 bg-primary/10 text-primary text-sm border border-primary/20 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 mr-2" />
          First Principles Documentation
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Your Learning Dashboard
        </h1>
        <p className="text-lg text-muted-foreground mb-6 max-w-lg mx-auto">
          Track your progress, save articles for later, and continue where you
          left off.
        </p>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          <Badge
            variant="secondary"
            className="px-3 py-1.5 text-sm font-medium bg-black/10 backdrop-blur-sm"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            {availableDocuments.length} Documents
          </Badge>
          <Badge
            variant="secondary"
            className="px-3 py-1.5 text-sm font-medium bg-black/10 backdrop-blur-sm"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            {todoList.filter((item) => item.completed).length} Completed
          </Badge>
          <Badge
            variant="secondary"
            className="px-3 py-1.5 text-sm font-medium bg-black/10 backdrop-blur-sm"
          >
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            {readingHistory.length} Read
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default Hero;
