import React from "react";

/**
 * BlockquoteRender Component
 *
 * Renders blockquote elements with styled left border and consistent formatting.
 */
const BlockquoteRender: React.FC<
  React.ComponentPropsWithoutRef<"blockquote">
> = (props) => {
  return (
    <blockquote
      {...props}
      className="border-l-2 border-gray-600 pl-4 my-6 py-1 text-gray-400 italic"
    />
  );
};

export default BlockquoteRender;
