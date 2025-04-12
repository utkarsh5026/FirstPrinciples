import React from "react";
import { motion } from "framer-motion";
import { fromSnakeToTitleCase } from "@/utils/string";

interface StatCardProps {
  title: string;
  value: string;
  footer?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

/**
 * 🌟 StatCard is an elegant component that showcases important statistics in a visually appealing way!
 *
 * Features:
 * - Smooth hover animations for an interactive feel
 * - Optional icon integration for visual context
 * - Highlight mode for emphasizing important stats
 * - Optional trend indicator to show changes over time
 * - Clean, minimalist design with subtle depth effects
 *
 * Use this component to display key metrics, achievements, or status indicators throughout your application.
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  footer,
  icon,
  highlight = false,
}) => {
  return (
    <motion.div
      className={`rounded-lg p-3 backdrop-blur-sm transition-all relative ${
        highlight
          ? "bg-primary/10 border border-primary/20"
          : "bg-secondary/10 hover:bg-secondary/20"
      }`}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <div className="text-lg font-bold mt-1 truncate flex items-center gap-2 font-cascadia-code">
        {icon}
        <span className={highlight ? "text-primary" : ""}>
          {fromSnakeToTitleCase(value)}
        </span>
      </div>
      {footer && (
        <div className="text-xs text-muted-foreground mt-1">{footer}</div>
      )}

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/40"
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default StatCard;
