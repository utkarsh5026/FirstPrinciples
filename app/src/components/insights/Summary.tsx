import { BookOpen, BookOpenCheck, Clock, BookMarked } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SummaryProps {
  totalDocuments: number;
  readDocuments: number;
  completionPercentage: number;
  mostRead: string;
  mostReadCount: number;
}

const Summary: React.FC<SummaryProps> = ({
  totalDocuments,
  readDocuments,
  completionPercentage,
  mostRead,
  mostReadCount,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
      <div className="bg-secondary/10 rounded-lg p-3 flex flex-col justify-between">
        <div className="text-xs text-muted-foreground flex items-center">
          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
          Documents
        </div>
        <div className="text-xl font-bold mt-1">{totalDocuments}</div>
        <div className="text-xs text-muted-foreground mt-1">
          Total available
        </div>
      </div>

      <div className="bg-secondary/10 rounded-lg p-3 flex flex-col justify-between">
        <div className="text-xs text-muted-foreground flex items-center">
          <BookOpenCheck className="h-3.5 w-3.5 mr-1.5" />
          Read
        </div>
        <div className="text-xl font-bold mt-1">{readDocuments}</div>
        <div className="text-xs text-muted-foreground mt-1">
          Documents completed
        </div>
      </div>

      <div className="bg-secondary/10 rounded-lg p-3 flex flex-col justify-between">
        <div className="text-xs text-muted-foreground flex items-center">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          Completion
        </div>
        <div className="text-xl font-bold mt-1">
          {Math.round(completionPercentage)}%
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          <Progress value={completionPercentage} className="h-1 mt-1" />
        </div>
      </div>

      <div className="bg-secondary/10 rounded-lg p-3 flex flex-col justify-between">
        <div className="text-xs text-muted-foreground flex items-center">
          <BookMarked className="h-3.5 w-3.5 mr-1.5" />
          Most Read
        </div>
        <div className="text-lg font-bold mt-1 truncate">
          {mostReadCount > 0 ? mostRead : "None"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {mostReadCount > 0 ? `${mostReadCount} reads` : "No data"}
        </div>
      </div>
    </div>
  );
};

export default Summary;
