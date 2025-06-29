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
import { Zap, Info, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useContainerAnimation,
  useInsightTheme,
  type Color,
  type Variant,
} from "./useContainer";
import styles from "./container.module.css";

export type CardContainerInsight = {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: React.ElementType;
  tooltip?: string;
};

export interface CardContainerProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  infoTooltip?: string;
  children: React.ReactNode;
  insights?: CardContainerInsight[];
  className?: string;
  baseColor?: Color;
  variant?: Variant;
  delay?: number;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
  onCardClick?: () => void;
  compact?: boolean;
}

const CardContainer: React.FC<CardContainerProps> = ({
  title,
  description,
  icon: Icon,
  infoTooltip,
  children,
  insights,
  className,
  baseColor = "primary",
  variant = "default",
  delay = 0,
  footer,
  headerAction,
  onCardClick,
  compact = false,
}) => {
  const {
    cardRef,
    isVisible,
    isHovered,
    animationStates,
    handleMouseEnter,
    handleMouseLeave,
  } = useContainerAnimation(delay);

  const { iconColor } = useInsightTheme(baseColor, variant);

  const isClickable = !!onCardClick;

  return (
    <motion.div
      ref={cardRef}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={animationStates.card}
      className="h-full w-full font-type-mono"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card
        className={cn(
          "overflow-auto h-full transition-all duration-300 rounded-2xl",
          "bg-card/50 border-none shadow-sm",
          className,
          isClickable && "cursor-pointer hover:ring-1 hover:ring-primary/10"
        )}
        onClick={onCardClick}
      >
        <motion.div variants={animationStates.header}>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-y-0">
                <div className="flex items-center space-x-2">
                  {Icon && (
                    <div
                      className={cn(
                        "mr-2 p-1.5 rounded-lg bg-muted/50 border border-border/30",
                        iconColor,
                        styles["icon-pulse"],
                        // Subtle hover effect
                        "transition-colors duration-200 hover:bg-muted/70"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <CardTitle className="text-sm font-medium flex items-center text-card-foreground">
                    {title}

                    {infoTooltip && (
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <motion.div
                            className={cn(
                              "ml-2 opacity-50 hover:opacity-100 cursor-help transition-opacity",
                              styles["info-icon"]
                            )}
                            whileHover={{
                              rotate: [0, -5, 5, -5, 0],
                              scale: 1.1,
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-xs bg-popover border border-border shadow-lg p-3 rounded-lg"
                        >
                          <p className="text-xs text-popover-foreground">
                            {infoTooltip}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </CardTitle>
                </div>
              </div>

              {/* Header action area */}
              {headerAction && (
                <motion.div
                  variants={animationStates.headerAction}
                  className={cn(
                    "ml-auto flex items-center",
                    styles["header-action"]
                  )}
                >
                  {headerAction}
                </motion.div>
              )}

              {isClickable && !headerAction && (
                <motion.div
                  className="ml-auto"
                  animate={{ x: isHovered ? 3 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              )}
            </div>

            {/* Description */}
            {description && (
              <CardDescription className="text-xs mt-1 text-muted-foreground">
                {description}
              </CardDescription>
            )}

            {/* Modern insights badges */}
            {!compact && insights && insights.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {insights.map((insight, idx) => {
                  const InsightIcon = insight.icon;

                  return (
                    <motion.div
                      key={insight.label}
                      variants={animationStates.insight(idx)}
                      className={cn(
                        "text-xs py-1.5 px-3 rounded-2xl flex items-center gap-1.5",
                        "border transition-all duration-200",
                        insight.highlight
                          ? "bg-primary/10 border-primary/20 text-primary-foreground font-medium"
                          : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/50",
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
                        className={cn(
                          insight.highlight ? "font-medium text-foreground" : ""
                        )}
                      >
                        {insight.label}:
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          insight.highlight ? "text-primary" : "text-foreground"
                        )}
                      >
                        {insight.value}
                      </span>

                      {insight.tooltip && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              className="opacity-50 hover:opacity-100 cursor-help transition-opacity"
                              whileHover={{ scale: 1.2 }}
                            >
                              <Info className="h-2.5 w-2.5 text-muted-foreground" />
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="text-xs max-w-xs bg-popover border border-border"
                          >
                            <p className="text-popover-foreground">
                              {insight.tooltip}
                            </p>
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

        <motion.div variants={animationStates.content}>
          <CardContent className={cn("pt-0 relative", !insights && "pt-2")}>
            <div className="relative z-10">{children}</div>
          </CardContent>
        </motion.div>

        {footer && (
          <motion.div variants={animationStates.footer}>
            <CardFooter className="px-6 py-3 border-t border-border/40 bg-muted/20 backdrop-blur-sm font-cascadia-code">
              {footer}
            </CardFooter>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default CardContainer;
