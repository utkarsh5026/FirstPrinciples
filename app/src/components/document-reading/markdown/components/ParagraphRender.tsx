import React from "react";

/**
 * ParagraphRender Component
 *
 * Renders paragraph elements with consistent styling.
 */
const ParagraphRender: React.FC<React.ComponentPropsWithoutRef<"p">> = (
  props
) => {
  return <p {...props} className="text-gray-300 my-4 leading-7 text-pretty" />;
};

export default ParagraphRender;
