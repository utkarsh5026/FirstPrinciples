import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import LinkRender from "./components/LinkRender";
import HeadingRender from "./components/HeadingRender";
import ParagraphRender from "./components/ParagraphRender";
import ListRender from "./components/ListRender";
import BlockquoteRender from "./components/BlockRender";
import CodeRender from "./components/CodeRender";
import TableRender from "./components/TableRender";
import HorizontalRuleRender from "./components/HorizontalRuleRender";
import ImageRender from "./components/ImageRender";

interface CustomMarkdownRendererProps {
  markdown: string;
  className?: string;
}

/**
 * ✨ CustomMarkdownRenderer
 *
 * A delightful component that transforms markdown text into beautiful React components!
 * This renderer handles all your markdown needs with style and grace.
 *
 * 🎨 Supports rich formatting including headings, paragraphs, lists, and more
 * 🔗 Renders links with special handling for navigation
 * 📊 Beautifully formats tables for data presentation
 * 📝 Displays code blocks with proper syntax
 * 🖼️ Renders images with optimized display
 */
const CustomMarkdownRenderer: React.FC<CustomMarkdownRendererProps> = ({
  markdown,
  className = "",
}) => {
  /**
   * 🧩 Custom component mapping for markdown elements
   * Each element gets its own specialized renderer for consistent styling
   */
  const components = {
    /* 
    📚 Headings with different levels
     */
    h1: (props: React.ComponentPropsWithoutRef<"h1">) => (
      <HeadingRender level={1} {...props} />
    ),
    h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
      <HeadingRender level={2} {...props} />
    ),
    h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
      <HeadingRender level={3} {...props} />
    ),

    /* 
    📄 Paragraphs for text content
     */
    p: (props: React.ComponentPropsWithoutRef<"p">) => (
      <ParagraphRender {...props} />
    ),

    /* 
    📋 Lists for organizing information
     */
    ul: (props: React.ComponentPropsWithoutRef<"ul">) => (
      <ListRender type="ul" props={props} />
    ),
    ol: (props: React.ComponentPropsWithoutRef<"ol">) => (
      <ListRender type="ol" props={props} />
    ),
    li: (props: React.ComponentPropsWithoutRef<"li">) => (
      <ListRender type="li" props={props} />
    ),

    /* 
    💬 Blockquotes for highlighting important text
     */
    blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
      <BlockquoteRender {...props} />
    ),

    /* 
    💻 Code blocks with syntax highlighting
     */
    code: (
      props: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }
    ) => <CodeRender {...props} />,

    /* 
    📊 Tables for structured data
     */
    table: (props: React.ComponentPropsWithoutRef<"table">) => (
      <TableRender type="table" props={props} />
    ),
    thead: (props: React.ComponentPropsWithoutRef<"thead">) => (
      <TableRender type="thead" props={props} />
    ),
    tbody: (props: React.ComponentPropsWithoutRef<"tbody">) => (
      <TableRender type="tbody" props={props} />
    ),
    tr: (props: React.ComponentPropsWithoutRef<"tr">) => (
      <TableRender type="tr" props={props} />
    ),
    th: (props: React.ComponentPropsWithoutRef<"th">) => (
      <TableRender type="th" props={props} />
    ),
    td: (props: React.ComponentPropsWithoutRef<"td">) => (
      <TableRender type="td" props={props} />
    ),

    /* 
    ➖ Horizontal rule for section dividers
     */
    hr: (props: React.ComponentPropsWithoutRef<"hr">) => (
      <HorizontalRuleRender {...props} />
    ),

    /* 
    🔗 Links with special handling
     */
    a: (props: React.ComponentPropsWithoutRef<"a">) => (
      <LinkRender {...props}>{props.children}</LinkRender>
    ),

    /* 
    🖼️ Images with optimized display
     */
    img: (props: React.ComponentPropsWithoutRef<"img">) => (
      <ImageRender {...props} />
    ),
  };

  return (
    <div className={cn("markdown-content font-type-mono", className)}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
        ]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default CustomMarkdownRenderer;
