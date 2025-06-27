import { cn } from "@/lib/utils";
import React from "react";

/**
 * ParagraphRender Component
 *
 * Renders paragraph elements with enhanced typography and spacing for optimal readability.
 * Features responsive design, improved visual hierarchy, and better reading comfort.
 * Optimized for both mobile and desktop viewing experiences with proper text flow.
 */
const ParagraphRender: React.FC<React.ComponentPropsWithoutRef<"p">> = (
  props
) => {
  return (
    <p
      {...props}
      className={cn(
        "text-foreground/80",
        "my-4 xs:my-5 sm:my-6 lg:my-7",
        "leading-7 xs:leading-8 sm:leading-9 lg:leading-10",
        "text-pretty break-words",
        "text-base xs:text-lg sm:text-xl lg:text-xl",
        "px-0.5 xs:px-0",
        "first:mt-0 last:mb-0",
        "tracking-normal xs:tracking-wide",
        "font-normal",
        props.className
      )}
    />
  );
};

export default ParagraphRender;
