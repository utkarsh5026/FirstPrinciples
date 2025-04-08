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

/**
 * 🌟 Introduction Component
 *
 * This delightful component serves as a warm welcome to your knowledge analytics journey!
 * It showcases key insights into your learning progress, helping you understand how
 * much you've explored and how well you're balancing your reading. 📚✨
 *
 * With vibrant visualizations, it highlights:
 * - The number of categories you've explored, giving you a sense of your learning breadth. 🌍
 * - Your coverage score, which reflects how thoroughly you've engaged with the material. 📊
 * - Your balance score, indicating how evenly you've distributed your reading across categories. ⚖️
 * - The total documents you've read, celebrating your achievements in knowledge acquisition! 🎉
 *
 * This component is designed to inspire and motivate you on your learning path,
 * making your analytics experience both informative and enjoyable! 😊
 */
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
