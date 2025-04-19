import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ChartContainerProps {
  children: React.ReactNode;
  left?: {
    icon?: React.ElementType;
    label: string;
    value: string;
    className?: string;
  };
  right?: {
    icon?: React.ElementType;
    value: string;
    className?: string;
  };
  className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  left,
  right,
  className,
}) => {
  return (
    <motion.div
      className={cn("h-full w-full", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="h-full space-y-3">
        <div className="flex justify-between items-center h-6 px-2">
          {left && (
            <div className={cn("flex items-center gap-1.5", left.className)}>
              {left.icon && <left.icon className="h-3 w-3 text-primary" />}
              <div className="text-xs">
                <span>{left.label}</span>
                <span className="font-medium text-primary text-xs">
                  {left.value}
                </span>
              </div>
            </div>
          )}

          {right && (
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1.5 text-xs rounded-2xl",
                right.className
              )}
            >
              {right.icon && <right.icon className="h-3 w-3 text-primary" />}
              <div className="text-xs">
                <span className="font-medium text-primary">{right.value}</span>
              </div>
            </Badge>
          )}
        </div>

        {/* The chart */}
        <div className="h-[calc(100%-1.5rem)]">{children}</div>
      </div>
    </motion.div>
  );
};

export default ChartContainer;
