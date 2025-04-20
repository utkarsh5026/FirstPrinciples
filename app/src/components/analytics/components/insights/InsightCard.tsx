import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface InsightCardProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  insights: { label: string; value: string; highlight?: boolean }[];
  className?: string;
  gradient?: string;
  delay?: number;
  iconColor?: string;
}

/**
 * InsightCard - A reusable component for displaying analytics insights
 *
 * This component creates a beautiful, consistent card layout for different analytics
 * visualizations, with proper heading, description, and data summary.
 * It includes subtle animations, color gradients, and visual enhancements.
 */
const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  icon: Icon,
  children,
  insights,
  className,
  gradient = "from-primary/5 to-primary/10",
  delay = 0,
  iconColor = "text-primary",
}) => {
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: delay,
        ease: "easeOut",
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        delay: delay + 0.1,
        ease: "easeOut",
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: delay + 0.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="h-full"
    >
      <Card
        className={cn(
          "overflow-hidden border-primary/10 rounded-xl h-full shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl",
          `bg-gradient-to-br ${gradient}`,
          className
        )}
      >
        <motion.div variants={headerVariants}>
          <CardHeader className="pb-2 relative">
            {/* Beautiful subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.15)_1px,transparent_0)]"
              style={{ backgroundSize: "16px 16px" }}
            ></div>

            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium flex items-center">
                  {Icon && (
                    <div
                      className={cn(
                        "mr-2 p-1.5 rounded-full bg-background/90 shadow-sm",
                        iconColor
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  )}
                  {title}
                </CardTitle>
                {description && (
                  <CardDescription className="text-xs">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>

            {/* Insights badges with improved styling */}
            {insights && insights.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: delay + 0.3 + idx * 0.1,
                      ease: "easeOut",
                    }}
                    className={cn(
                      "text-xs py-1 px-3 rounded-full flex items-center gap-1.5 border border-border/40",
                      insight.highlight
                        ? "bg-primary/10 text-primary-foreground font-medium"
                        : "bg-secondary/40 text-secondary-foreground"
                    )}
                  >
                    {insight.highlight && (
                      <Zap className="h-3 w-3 text-primary" />
                    )}
                    <span
                      className={cn(insight.highlight ? "font-medium" : "")}
                    >
                      {insight.label}:
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        insight.highlight ? "text-primary" : ""
                      )}
                    >
                      {insight.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </CardHeader>
        </motion.div>

        <motion.div variants={contentVariants}>
          <CardContent className={cn("pt-0 relative", !insights && "pt-2")}>
            {/* Inner shadow to add depth to the chart area */}
            <div
              className="absolute inset-0 pointer-events-none rounded-xl"
              style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}
            ></div>
            <div className="relative z-10">{children}</div>
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default InsightCard;
