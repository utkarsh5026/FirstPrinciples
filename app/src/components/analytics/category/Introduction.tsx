import { BrainCircuit } from "lucide-react";
import { Card } from "@/components/ui/card";

interface IntroductionProps {
  summaryStat: {
    exploredCategories: number;
    totalCategories: number;
    coverageScore: number;
    balanceScore: number;
    readDocuments: number;
  };
}

const Introduction: React.FC<IntroductionProps> = ({ summaryStat }) => {
  const stats = [
    {
      title: "Categories Explored",
      value: summaryStat.exploredCategories,
      total: summaryStat.totalCategories,
    },
    { title: "Coverage Score", value: summaryStat.coverageScore, total: 100 },
    { title: "Balance Score", value: summaryStat.balanceScore, total: 100 },
    { title: "Documents Read", value: summaryStat.readDocuments, total: 100 },
  ];
  return (
    <Card className="p-4 border-primary/10 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-xl">
          <BrainCircuit className="h-8 w-8 text-primary" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-medium">Enhanced Knowledge Analytics</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Advanced visualizations that reveal connections between categories
            and documents, showing how your knowledge flows and grows over time.
          </p>

          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map(({ title, value, total }) => {
              return (
                <div
                  className="bg-card p-2 rounded-2xl border border-border"
                  key={title}
                >
                  <div className="text-xs text-muted-foreground">{title}</div>
                  <div className="text-base font-bold mt-1">
                    {value}/{total}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Introduction;
