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

const CustomMarkdownRenderer: React.FC<CustomMarkdownRendererProps> = ({
  markdown,
  className = "",
}) => {
  const components = {
    h1: (props: React.ComponentPropsWithoutRef<"h1">) => (
      <HeadingRender level={1} {...props} />
    ),
    h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
      <HeadingRender level={2} {...props} />
    ),
    h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
      <HeadingRender level={3} {...props} />
    ),

    // Paragraphs
    p: (props: React.ComponentPropsWithoutRef<"p">) => (
      <ParagraphRender {...props} />
    ),

    // Lists
    ul: (props: React.ComponentPropsWithoutRef<"ul">) => (
      <ListRender type="ul" props={props} />
    ),
    ol: (props: React.ComponentPropsWithoutRef<"ol">) => (
      <ListRender type="ol" props={props} />
    ),
    li: (props: React.ComponentPropsWithoutRef<"li">) => (
      <ListRender type="li" props={props} />
    ),

    // Blockquotes
    blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
      <BlockquoteRender {...props} />
    ),

    // Code blocks and inline code
    code: (
      props: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }
    ) => <CodeRender {...props} />,

    // Tables
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

    // Horizontal rule
    hr: (props: React.ComponentPropsWithoutRef<"hr">) => (
      <HorizontalRuleRender {...props} />
    ),

    // Links
    a: (props: React.ComponentPropsWithoutRef<"a">) => (
      <LinkRender {...props}>{props.children}</LinkRender>
    ),

    // Images
    img: (props: React.ComponentPropsWithoutRef<"img">) => (
      <ImageRender {...props} />
    ),
  };

  return (
    <div className={cn("markdown-content font-type-mono", className)}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]} // GitHub Flavored Markdown support
        rehypePlugins={[
          rehypeRaw, // Allow HTML in markdown
          rehypeSlug, // Add IDs to headings
          [rehypeAutolinkHeadings, { behavior: "wrap" }], // Make headings linkable
        ]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default CustomMarkdownRenderer;
