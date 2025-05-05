import { CheckCircle2, ListTodo } from "lucide-react";
import CardContainer from "@/components/shared/container/CardContainer";
import { Progress } from "@/components/ui/progress";

interface TodoHeaderProps {
  status: {
    pendingCount: number;
    completedCount: number;
    totalCount: number;
  };
}

/**
 * TodoHeader Component
 *
 * A visual header showing progress stats for the reading list
 */
const TodoHeader: React.FC<TodoHeaderProps> = ({ status }) => {
  const cards = [
    {
      title: "To Read",
      value: status.pendingCount,
      icon: ListTodo,
    },
    {
      title: "Completed",
      value: status.completedCount,
      icon: CheckCircle2,
    },
    {
      title: "Total",
      value: status.totalCount,
      icon: ListTodo,
    },
  ];

  const completionPercentage =
    status.totalCount > 0
      ? (status.completedCount / status.totalCount) * 100
      : 0;

  return (
    <CardContainer
      title="Reading List"
      icon={ListTodo}
      description="Track your reading progress"
      variant="subtle"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center text-sm">
            <CheckCircle2 className="h-4 w-4 mr-1.5 text-primary" />
            <span className="font-medium">Reading Progress</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {status.completedCount} of {status.totalCount} completed
          </div>
        </div>

        <Progress
          value={completionPercentage}
          className="h-1 rounded-full mt-2 opacity-50"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-primary/5 rounded-2xl p-3 flex flex-col items-center justify-center"
          >
            <span className="text-xl font-bold">{card.value}</span>
            <span className="text-xs text-muted-foreground">{card.title}</span>
          </div>
        ))}
      </div>
    </CardContainer>
  );
};

export default TodoHeader;
