import React from "react";

type HeadingProps = React.ComponentPropsWithoutRef<"h1" | "h2" | "h3">;

interface HeadingRenderProps extends HeadingProps {
  level: 1 | 2 | 3;
}

/**
 * HeadingRender Component
 *
 * Renders h1, h2, and h3 headings with consistent styling and anchor links.
 * Includes hover-reveal anchor links for easy section linking.
 *
 * @param props - Component props including heading level and standard heading attributes
 */
const HeadingRender: React.FC<HeadingRenderProps> = ({ level, ...props }) => {
  const headingStyles = {
    1: "text-4xl font-bold mt-10 mb-4",
    2: "text-2xl font-semibold mt-8 mb-3",
    3: "text-xl font-normal mt-6 mb-3",
    4: "text-lg font-normal mt-6 mb-3",
  };

  const className = `${headingStyles[level]} group flex items-center text-primary`;
  const HeadingTag = `h${level}` as React.ElementType;

  return (
    <HeadingTag {...props} className={className}>
      {props.children}
    </HeadingTag>
  );
};

export default HeadingRender;
