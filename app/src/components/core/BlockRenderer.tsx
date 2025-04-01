// src/components/notion/BlockRenderer.tsx

import React from "react";
import { Block } from "@/components/core/type";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";

// Component for paragraph blocks
const ParagraphBlock = ({ content }: { content: string }) => {
  return (
    <p className="text-foreground my-3 leading-7 text-foreground/90">
      {content}
    </p>
  );
};

// Component for heading blocks
const HeadingBlock = ({
  content,
  level,
}: {
  content: string;
  level: 1 | 2 | 3;
}) => {
  switch (level) {
    case 1:
      return (
        <h1
          id={`heading-${content.toLowerCase().replace(/\s+/g, "-")}`}
          className="text-3xl font-bold mt-8 mb-4 text-primary"
        >
          {content}
        </h1>
      );
    case 2:
      return (
        <h2
          id={`heading-${content.toLowerCase().replace(/\s+/g, "-")}`}
          className="text-2xl font-semibold mt-6 mb-3 pb-2 border-b border-border"
        >
          {content}
        </h2>
      );
    case 3:
      return (
        <h3
          id={`heading-${content.toLowerCase().replace(/\s+/g, "-")}`}
          className="text-xl font-medium mt-5 mb-2"
        >
          {content}
        </h3>
      );
    default:
      return (
        <h3
          id={`heading-${content.toLowerCase().replace(/\s+/g, "-")}`}
          className="text-xl font-medium mt-5 mb-2"
        >
          {content}
        </h3>
      );
  }
};

// Component for list blocks
const ListBlock = ({
  items,
  ordered,
}: {
  items: { id: string; content: string }[];
  ordered: boolean;
}) => {
  const ListTag = ordered ? "ol" : "ul";
  const listClass = cn("my-4 ml-6", ordered ? "list-decimal" : "list-disc");

  return (
    <ListTag className={listClass}>
      {items.map((item) => (
        <li key={item.id} className="my-2 pl-1 leading-7 text-foreground/85">
          {item.content}
        </li>
      ))}
    </ListTag>
  );
};

// Component for code blocks with syntax highlighting
const CodeBlock = ({
  content,
  language,
}: {
  content: string;
  language?: string;
}) => {
  // Get a theme based on current color scheme (dark vs light)
  const isDarkMode = document.documentElement.classList.contains("dark");
  const syntaxTheme = isDarkMode ? vscDarkPlus : vs;

  return (
    <div className="my-4 rounded-md overflow-hidden border border-border">
      {language && (
        <div className="bg-secondary text-secondary-foreground px-4 py-2 text-sm font-mono border-b border-border flex justify-between items-center">
          <span>{language}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language || "text"}
          style={syntaxTheme}
          customStyle={{
            margin: 0,
            padding: "1rem",
            backgroundColor: "var(--color-card)",
            borderRadius: 0,
            fontSize: "0.875rem",
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// Component for quote blocks
const QuoteBlock = ({ content }: { content: string }) => {
  return (
    <blockquote className="border-l-4 border-primary/40 pl-4 my-6 py-2 text-muted-foreground italic bg-secondary/20 rounded-r-md pr-4">
      {content}
    </blockquote>
  );
};

// Component for divider blocks
const DividerBlock = () => {
  return <hr className="my-6 border-t border-border" />;
};

// Component for image blocks
const ImageBlock = ({ url, caption }: { url: string; caption?: string }) => {
  return (
    <figure className="my-4">
      <img
        src={url}
        alt={caption || "Image"}
        className="rounded-md max-w-full h-auto"
      />
      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

// Main block renderer component
const BlockRenderer = ({ block }: { block: Block }) => {
  switch (block.type) {
    case "paragraph":
      return <ParagraphBlock content={block.content} />;
    case "heading-1":
      return <HeadingBlock content={block.content} level={1} />;
    case "heading-2":
      return <HeadingBlock content={block.content} level={2} />;
    case "heading-3":
      return <HeadingBlock content={block.content} level={3} />;
    case "bulleted-list":
      return <ListBlock items={block.items} ordered={false} />;
    case "numbered-list":
      return <ListBlock items={block.items} ordered={true} />;
    case "code":
      return <CodeBlock content={block.content} language={block.language} />;
    case "quote":
      return <QuoteBlock content={block.content} />;
    case "divider":
      return <DividerBlock />;
    case "image":
      return <ImageBlock url={block.url} caption={block.caption} />;
    default:
      return null;
  }
};

export default BlockRenderer;
