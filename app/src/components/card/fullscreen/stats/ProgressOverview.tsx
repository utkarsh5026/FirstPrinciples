import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/components/analytics/utils";

interface ProgressOverviewProps {
  documentProgress: number;
  readSections: Set<string>;
  sections: Array<{ id: string; title: string; wordCount: number }>;
  wordsRead: number;
  timeLeft: string;
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  documentProgress,
  readSections,
  sections,
  wordsRead,
  timeLeft,
}) => {
  return (
    <Card className="p-6 border-primary/15 bg-gradient-to-br from-primary/5 via-primary/8 to-primary/12 overflow-hidden relative font-cascadia-code shadow-sm hover:shadow-md transition-all duration-300 rounded-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative z-10">
        <div className="flex-1">
          <h3 className="text-base font-medium flex items-center gap-2 mb-4">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <span className="text-primary/90">
              {documentProgress === 100
                ? "Reading Complete!"
                : "Reading Progress"}
            </span>
          </h3>

          <div className="mt-1 mb-3 relative">
            <Progress
              value={documentProgress}
              className="h-2.5 bg-secondary/20 overflow-hidden"
              style={{
                borderRadius: "4px",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
              }}
            />
            {documentProgress > 2 && (
              <div
                className="absolute top-0 h-full overflow-hidden"
                style={{
                  width: `${documentProgress}%`,
                  maxWidth: "100%",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-primary opacity-20 animate-pulse"></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 text-sm mt-5 gap-2">
            <div className="text-center p-2 rounded-md bg-secondary/5 border border-primary/5">
              <div className="text-xs text-muted-foreground mb-1">Sections</div>
              <div className="font-medium text-base">
                {readSections.size}/{sections.length}
              </div>
            </div>
            <div className="text-center p-2 rounded-md bg-secondary/5 border border-primary/5">
              <div className="text-xs text-muted-foreground mb-1">
                Words Read
              </div>
              <div className="font-medium text-base">
                {formatNumber(wordsRead)}
              </div>
            </div>
            <div className="text-center p-2 rounded-md bg-secondary/5 border border-primary/5">
              <div className="text-xs text-muted-foreground mb-1">
                Completion
              </div>
              <div className="font-medium text-base">{documentProgress}%</div>
            </div>
          </div>
        </div>

        <div className="border-l border-primary/10 pl-5 hidden sm:flex sm:flex-col sm:justify-center">
          <div className="text-xs text-muted-foreground mb-1">
            Estimated Time Left
          </div>
          <div className="text-xl font-medium text-primary tracking-tight">
            {timeLeft}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProgressOverview;
