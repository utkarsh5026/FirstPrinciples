import { BookOpen, Clock, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import getIconForTech from "@/components/icons";

interface RecentReadsProps {
  recentActivity: {
    path: string;
    title: string;
    lastReadAt: string;
    readCount: number;
  }[];
  onSelectDocument: (path: string, title: string) => void;
}

const RecentReads: React.FC<RecentReadsProps> = ({
  recentActivity,
  onSelectDocument,
}) => {
  return (
    <Card className="p-4 border-primary/10 h-[365px] overflow-hidden flex flex-col rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium flex items-center">
          <BookOpen className="h-4 w-4 mr-2 text-primary" />
          Recent Reads
        </h4>
        <Badge variant="outline" className="text-xs">
          Latest
        </Badge>
      </div>

      {recentActivity.length > 0 ? (
        <div className="overflow-auto flex-1 -mr-2 pr-2">
          <div className="space-y-2">
            {recentActivity.map(({ path, title, lastReadAt, readCount }) => {
              const CategoryIcon = getIconForTech(path.split("/")[0]);
              return (
                <button
                  key={path}
                  className="flex items-center w-full gap-3 p-2.5 rounded-md hover:bg-primary/5 transition-colors cursor-pointer border border-transparent hover:border-primary/10"
                  onClick={() => onSelectDocument(path, title)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate text-left">
                      {title}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-between mt-0.5">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 inline-block" />
                        <span>
                          {new Date(lastReadAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {readCount > 1 && (
                        <Badge variant="outline" className="text-[10px] h-4">
                          Read {readCount}×
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center flex-col">
          <BookOpen className="h-12 w-12 text-muted-foreground opacity-20 mb-3" />
          <p className="text-muted-foreground text-sm">
            No reading activity yet
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Start reading documents to track your progress
          </p>
        </div>
      )}
    </Card>
  );
};

export default RecentReads;
