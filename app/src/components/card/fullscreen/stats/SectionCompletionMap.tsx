import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatTimeInMs } from "@/utils/time";
import { Clock, LayoutList, CheckCircle2, ChevronRight } from "lucide-react";

interface SectionCompletionMapProps {
  sections: Array<{
    index: number;
    title: string;
    wordCount: number;
    timeSpent: number;
    isRead: boolean;
    isCurrent: boolean;
  }>;
}

const SectionCompletionMap: React.FC<SectionCompletionMapProps> = ({
  sections,
}) => {
  return (
    <div className="font-cascadia-code">
      <h3 className="text-sm font-medium mb-4 flex items-center">
        <div className="bg-primary/10 p-1.5 rounded-md mr-2">
          <LayoutList className="h-4 w-4 text-primary" />
        </div>
        <span className="text-primary/90">Section Completion Map</span>
      </h3>

      <div className="grid grid-cols-1 gap-3 mt-3">
        {sections.map((section) => (
          <div
            key={section.index}
            className={cn(
              "flex items-center p-3.5 rounded-2xl border transition-all duration-200",
              "hover:shadow-sm group relative overflow-hidden",
              section.isCurrent
                ? "bg-gradient-to-r from-primary/15 to-primary/5 border-primary/30"
                : section.isRead
                ? "bg-secondary/10 border-border/30 hover:bg-secondary/15"
                : "bg-secondary/5 border-border/20 hover:bg-secondary/10"
            )}
          >
            {/* Background indicator for current section */}
            {section.isCurrent && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse-slow opacity-70"></div>
            )}

            {/* Section indicator */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0 transition-all",
                "font-medium shadow-sm",
                section.isCurrent
                  ? "bg-primary text-primary-foreground scale-110"
                  : section.isRead
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary/30 text-muted-foreground"
              )}
            >
              {section.index}
            </div>

            <div className="flex-1 min-w-0 relative z-10">
              <div className="flex justify-between items-baseline">
                <span
                  className={cn(
                    "text-sm font-medium truncate mr-2",
                    section.isCurrent
                      ? "text-primary"
                      : section.isRead
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {section.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap px-2 py-0.5 bg-background/50 rounded-full">
                    {section.wordCount} words
                  </span>
                </div>
              </div>

              {/* Time spent info */}
              {section.isRead && (
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1.5 inline-block" />
                  <span className="font-medium">
                    {formatTimeInMs(section.timeSpent)}
                  </span>

                  {section.isCurrent && (
                    <Badge className="ml-3 h-5 py-0 bg-primary/20 text-primary font-normal border border-primary/10">
                      Current
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {section.isRead ? (
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center ml-2 flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
            ) : section.isCurrent ? (
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center ml-2 flex-shrink-0 animate-pulse">
                <ChevronRight className="h-4 w-4 text-primary" />
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center ml-2 flex-shrink-0 opacity-50">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionCompletionMap;
