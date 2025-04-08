import { fromSnakeToTitleCase } from "@/utils/string";

interface StatCardProps {
  title: string;
  value: string;
  footer?: string;
}
/**
 * 🌟 StatCard is a delightful component that showcases important statistics in a visually appealing way!
 * It presents a title, a value, and an optional footer, making it easy for users to grasp key information at a glance.
 *
 * 🎨 The design is user-friendly, with a soft background and rounded corners, ensuring a pleasant viewing experience.
 *
 * 💡 Whether you're displaying performance metrics, progress indicators, or any other data, StatCard makes it engaging and accessible!
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, footer }) => {
  return (
    <div className="bg-secondary/10 rounded-lg p-3">
      <div className="text-xs text-muted-foreground">
        {fromSnakeToTitleCase(title)}
      </div>
      <div className="text-lg font-bold mt-1 truncate">{value}</div>
      {footer && <div className="text-xs text-muted-foreground">{footer}</div>}
    </div>
  );
};

export default StatCard;
