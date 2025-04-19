import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Zap, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import styles from "./container.module.css"; // Use CSS modules instead of direct import

interface InsightCardProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  infoTooltip?: React.ReactNode;
  children: React.ReactNode;
  insights: {
    label: string;
    value: string;
    highlight?: boolean;
    icon?: React.ElementType;
    tooltip?: string;
  }[];
  className?: string;
  gradient?: string;
  delay?: number;
  iconColor?: string;
  footer?: React.ReactNode;
}

/**
 * ChartContainer - A reusable component for displaying analytics insights
 *
 * This component creates a beautiful, consistent card layout for different analytics
 * visualizations, with proper heading, description, and data summary.
 * It includes subtle animations, color gradients, and visual enhancements.
 *
 * Features:
 * - Animated entrance and hover effects
 * - Support for tooltips on both card level and individual insights
 * - Customizable gradient backgrounds
 * - Mobile-optimized layout and interactions
 * - Optional footer section
 * - Icon support for individual insights
 */
const ChartContainer: React.FC<InsightCardProps> = ({
  title,
  description,
  icon: Icon,
  infoTooltip,
  children,
  insights,
  className,
  gradient = "from-primary/5 to-primary/10",
  delay = 0,
  iconColor = "text-primary",
  footer,
}) => {
  const [hovered, setHovered] = useState(false);

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

  const footerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: delay + 0.3,
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Card
        className={cn(
          "overflow-hidden border-primary/10 h-full shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl",
          `bg-gradient-to-br ${gradient}`,
          className,
          styles["insight-card"]
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
                        iconColor,
                        styles["icon-pulse"]
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  )}
                  {title}

                  {infoTooltip && (
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <motion.div
                          className={cn(
                            "ml-2 opacity-40 hover:opacity-100 cursor-help transition-opacity",
                            styles["info-icon"]
                          )}
                          whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Info className="h-3.5 w-3.5 text-foreground" />
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-xs bg-card/95 backdrop-blur-sm border border-border/40 shadow-lg p-3 rounded-xl"
                      >
                        <div className="text-xs">{infoTooltip}</div>
                      </TooltipContent>
                    </Tooltip>
                  )}
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
                {insights.map((insight, idx) => {
                  const InsightIcon = insight.icon;

                  return (
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
                          : "bg-secondary/40 text-secondary-foreground",
                        styles["insight-badge"]
                      )}
                    >
                      {insight.highlight && !InsightIcon && (
                        <Zap className="h-3 w-3 text-primary" />
                      )}
                      {InsightIcon && (
                        <InsightIcon
                          className={cn(
                            "h-3 w-3",
                            insight.highlight
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        />
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

                      {insight.tooltip && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              className="opacity-40 hover:opacity-100 cursor-help"
                              whileHover={{ scale: 1.2 }}
                            >
                              <Info className="h-2.5 w-2.5 text-foreground" />
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="text-xs max-w-xs bg-card/95 backdrop-blur-sm border border-border/40"
                          >
                            {insight.tooltip}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </motion.div>
                  );
                })}
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
            <div className="relative z-10">
              <motion.div
                animate={hovered ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className={styles["chart-container"]}
              >
                {children}
              </motion.div>
            </div>
          </CardContent>
        </motion.div>

        {footer && (
          <motion.div variants={footerVariants}>
            <CardFooter className="px-6 py-3 border-t border-border/20 bg-secondary/10 backdrop-blur-sm">
              {footer}
            </CardFooter>
          </motion.div>
        )}

        {/* Decorative elements for visual appeal */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl bg-primary/10 pointer-events-none"></div>
        <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full blur-xl bg-primary/5 pointer-events-none"></div>
      </Card>
    </motion.div>
  );
};

export default ChartContainer;
