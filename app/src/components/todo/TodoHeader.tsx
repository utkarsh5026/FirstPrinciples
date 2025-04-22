import { BookOpen, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/hooks/ui/use-theme";
import { useReadingStore } from "@/stores";
import CardContainer from "../container/CardContainer";

/**
 * 🎉 TodoHeader Component
 *
 * This component serves as the cheerful header for your reading list!
 * It displays important statistics about your reading progress,
 * including how many documents are pending, completed, and your overall
 * progress percentage. 📚✨
 *
 * With a delightful layout and engaging icons, it helps you keep track
 * of your reading journey in a visually appealing way.
 * The background elements add a touch of flair, making your reading
 * experience even more enjoyable! 🌈
 */
const TodoHeader: React.FC = () => {
  const { currentTheme } = useTheme();
  const stats = useReadingStore((state) => state.status);

  const { pendingCount, completedCount, completionPercentage, totalCount } =
    stats;

  const headerStats = [
    {
      icon: <BookOpen className="h-4 w-4 text-primary" />,
      label: "To Read",
      value: pendingCount,
    },
    {
      icon: <CheckCircle2 className="h-4 w-4 text-primary" />,
      label: "Completed",
      value: completedCount,
    },
    {
      icon: <Clock className="h-4 w-4 text-primary" />,
      label: "Progress",
      value: completionPercentage,
      suffix: "%",
    },
  ];

  return (
    <CardContainer
      title="Reading List"
      icon={ListTodo}
      description="Track documents you want to read, Basicly a todo list ❤️‍🔥"
      variant="subtle"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-primary/5 blur-xl"></div>
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(${currentTheme.primary}60 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div className="relative">
        {/* Reading list stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {headerStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {totalCount > 0 && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-1">Completion</div>
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-primary">
                    {completedCount}
                  </span>{" "}
                  of {totalCount} completed
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-secondary/20">
                <div
                  style={{ width: `${completionPercentage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary/80 transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CardContainer>
  );
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  suffix?: string;
}

/**
 * StatCard component displays a statistical information card with an icon, label, value, and optional suffix.
 *
 * @param {StatCardProps} props - The properties of the StatCard component.
 * @param {string} props.label - The label of the statistical information.
 * @param {(number|string)} props.value - The value of the statistical information.
 * @param {React.ReactNode} props.icon - The icon to be displayed alongside the statistical information.
 * @param {string} [props.suffix=""] - The suffix to be appended to the value.
 *
 * @returns {React.ReactElement} The StatCard component.
 */
const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  suffix = "",
}) => (
  <Card className="p-3 sm:p-4 border-primary/10 hover:border-primary/30 transition-colors bg-secondary/5 rounded-2xl sm:rounded-2xl">
    <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2 sm:gap-3">
      <div className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 flex items-center justify-center mb-1 sm:mb-0 sm:order-last">
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-xl sm:text-2xl font-bold truncate">
          {value}
          {suffix}
        </p>
      </div>
    </div>
  </Card>
);

export default TodoHeader;
