import { BookOpen, CheckCircle2, Clock, ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/components/theme/context/ThemeContext";

interface TodoHeaderProps {
  handleAddButtonClick: () => void;
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
  pendingCount: number;
  todoListLength: number;
}

const TodoHeader: React.FC<TodoHeaderProps> = ({
  handleAddButtonClick,
  completedCount,
  completionPercentage,
  totalCount,
  pendingCount,
  todoListLength,
}) => {
  const { currentTheme } = useTheme();

  const stats = [
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
    <div className="relative overflow-hidden border border-primary/20 bg-card p-6 rounded-4xl">
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
        {/* Header with icon */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ListTodo className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Reading List</h2>
              <p className="text-sm text-muted-foreground">
                Track documents you want to read
              </p>
            </div>
          </div>

          <Button
            className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-2xl"
            onClick={handleAddButtonClick}
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add
          </Button>
        </div>

        {/* Reading list stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {todoListLength > 0 && (
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
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  suffix = "",
}) => (
  <Card className="p-3 sm:p-4 border-primary/10 hover:border-primary/30 transition-colors bg-secondary/5 rounded-2xl sm:rounded-2xl">
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5 sm:mb-1">{label}</p>
        <p className="text-xl sm:text-2xl font-bold truncate">
          {value}
          {suffix}
        </p>
      </div>
      <div className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
    </div>
  </Card>
);

export default TodoHeader;
