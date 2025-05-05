import React from "react";

/**
 * BlockquoteRender Component
 *
 * Renders blockquote elements with styled left border and consistent formatting.
 * Uses theme colors for a more cohesive and impactful visual appearance.
 */
const BlockquoteRender: React.FC<
  React.ComponentPropsWithoutRef<"blockquote">
> = (props) => {
  return (
    <blockquote
      {...props}
      className="border-l-4 border-primary/20 pl-4 my-6 py-2 italic text-foreground rounded-2xl bg-card"
    />
  );
};

export default BlockquoteRender;
