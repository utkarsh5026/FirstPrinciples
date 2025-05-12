import { BookMarked, CheckCircle, Clock, CircleDot } from "lucide-react";
import { motion } from "framer-motion";

// Types for legend items
type LegendItem = {
  icon?: React.ReactNode;
  color?: string;
  text: string;
  hoverColor: string;
};

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 5 },
  show: { opacity: 1, y: 0 },
};

// Legend item component
const LegendItem = ({ icon, color, text, hoverColor }: LegendItem) => (
  <motion.div
    className={`flex items-center p-1.5 rounded-lg hover:${hoverColor}`}
    variants={item}
  >
    <div
      className={`w-6 h-6 flex items-center justify-center rounded-full ${hoverColor} mr-2`}
    >
      {icon || <div className={`w-3 h-3 rounded-full ${color}`} />}
    </div>
    <span className={`ml-1 ${color ? `text-${color}` : ""}`}>{text}</span>
  </motion.div>
);

const Legend = () => {
  // Legend data
  const statusItems: LegendItem[] = [
    {
      icon: <CircleDot size={12} className="text-muted-foreground/40" />,
      text: "Unread",
      hoverColor: "bg-secondary/20",
    },
    {
      icon: <Clock size={12} className="text-green-400" />,
      text: "Previously read",
      hoverColor: "bg-green-400/10",
      color: "green-400",
    },
    {
      icon: <BookMarked size={12} className="text-primary" />,
      text: "In reading list",
      hoverColor: "bg-primary/10",
      color: "primary",
    },
    {
      icon: <CheckCircle size={12} className="text-green-500" />,
      text: "Completed",
      hoverColor: "bg-green-500/10",
      color: "green-500",
    },
  ];

  const colorItems: LegendItem[] = [
    {
      color: "bg-green-200",
      text: "Previously read",
      hoverColor: "bg-green-200/10",
    },
    {
      color: "bg-primary",
      text: "In reading list",
      hoverColor: "bg-primary/10",
    },
    {
      color: "bg-green-500",
      text: "Completed",
      hoverColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="px-4 py-4 border-t border-border bg-secondary/5 text-xs">
      <motion.div
        className="font-medium mb-3 text-foreground"
        variants={item}
        initial="hidden"
        animate="show"
      >
        Legend:
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Status icons */}
        <motion.div className="space-y-2.5" variants={item}>
          {statusItems.map((item, index) => (
            <LegendItem key={index} {...item} />
          ))}
        </motion.div>

        {/* Color indicators */}
        <motion.div className="space-y-2.5" variants={item}>
          <motion.div
            className="font-medium mb-1.5 text-foreground mt-2 sm:mt-0"
            variants={item}
          >
            Color indicators:
          </motion.div>
          {colorItems.map((item, index) => (
            <LegendItem key={index} {...item} />
          ))}
        </motion.div>
      </motion.div>

      {/* Mobile swipe hint */}
      <motion.div
        className="mt-4 pt-3 border-t border-border/50 text-muted-foreground italic text-center sm:text-left"
        variants={item}
        initial="hidden"
        animate="show"
      >
        <span className="sm:hidden">Swipe right to close sidebar</span>
        <span className="hidden sm:inline">Press ESC or click X to close</span>
      </motion.div>
    </div>
  );
};

export default Legend;
