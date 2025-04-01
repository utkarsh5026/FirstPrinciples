import React from "react";
import { Link } from "lucide-react";

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
    1: "text-2xl font-medium mt-10 mb-4 text-white group flex items-center",
    2: "text-xl font-medium mt-8 mb-3 text-gray-100 group flex items-center",
    3: "text-lg font-medium mt-6 mb-3 text-gray-200 group flex items-center",
  };

  const getLinkSize = () => {
    if (level === 1) return 16;
    if (level === 2) return 14;
    return 12;
  };

  const className = headingStyles[level];
  const linkSize = getLinkSize();
  const HeadingTag = `h${level}` as React.ElementType;

  return (
    <HeadingTag {...props} className={className}>
      {props.children}
      <a
        href={`#${props.id}`}
        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Link to section"
      >
        <Link size={linkSize} className="text-gray-500 hover:text-primary" />
      </a>
    </HeadingTag>
  );
};

export default HeadingRender;
