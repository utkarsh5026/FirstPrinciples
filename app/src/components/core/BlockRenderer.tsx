// src/components/core/BlockRenderer.tsx

import React from "react";
import { Block } from "@/components/core/type";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy } from "lucide-react";

// Component for paragraph blocks - optimized for readability
const ParagraphBlock = ({ content, id }: { content: string; id: string }) => {
  return (
    <p id={id} className="text-gray-300 my-4 leading-7">
      {content}
    </p>
  );
};

// Component for heading blocks with minimal styling
const HeadingBlock = ({
  content,
  level,
  id,
}: {
  content: string;
  level: 1 | 2 | 3;
  id: string;
}) => {
  switch (level) {
    case 1:
      return (
        <h1 id={id} className="text-2xl font-medium mt-10 mb-4 text-white">
          {content}
        </h1>
      );
    case 2:
      return (
        <h2 id={id} className="text-xl font-medium mt-8 mb-3 text-gray-100">
          {content}
        </h2>
      );
    case 3:
      return (
        <h3 id={id} className="text-lg font-medium mt-6 mb-3 text-gray-200">
          {content}
        </h3>
      );
    default:
      return (
        <h3 id={id} className="text-lg font-medium mt-6 mb-3 text-gray-200">
          {content}
        </h3>
      );
  }
};

// Component for list blocks
const ListBlock = ({
  items,
  ordered,
  id,
}: {
  items: { id: string; content: string }[];
  ordered: boolean;
  id: string;
}) => {
  const ListTag = ordered ? "ol" : "ul";
  const listClass = cn("my-4 ml-6", ordered ? "list-decimal" : "list-disc");

  return (
    <ListTag id={id} className={listClass}>
      {items.map((item) => (
        <li key={item.id} className="my-2 pl-1 leading-7 text-gray-300">
          {item.content}
        </li>
      ))}
    </ListTag>
  );
};

// Component for code blocks with minimal styling
const CodeBlock = ({
  content,
  language,
  id,
}: {
  content: string;
  language?: string;
  id: string;
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={id}
      className="my-6 rounded-md overflow-hidden border border-[#222222]"
    >
      {/* Simple header for code blocks */}
      <div className="bg-[#1c1c1c] text-gray-400 px-4 py-2 text-sm font-mono border-b border-[#222222] flex justify-between items-center">
        <span>{language || "code"}</span>
        <button
          onClick={copyToClipboard}
          className="p-1 rounded hover:bg-[#252525] transition-colors"
          aria-label={copied ? "Copied!" : "Copy code"}
        >
          <Copy
            size={16}
            className={copied ? "text-gray-200" : "text-gray-500"}
          />
        </button>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language || "text"}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            backgroundColor: "#1a1a1a",
            fontSize: "0.875rem",
            lineHeight: 1.6,
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// Component for quote blocks with minimal styling
const QuoteBlock = ({ content, id }: { content: string; id: string }) => {
  return (
    <blockquote
      id={id}
      className="border-l-2 border-gray-600 pl-4 my-6 py-1 text-gray-400 italic"
    >
      {content}
    </blockquote>
  );
};

// Simple divider
const DividerBlock = ({ id }: { id: string }) => {
  return <hr id={id} className="my-8 border-t border-[#222222]" />;
};

// Simple image block
const ImageBlock = ({
  url,
  caption,
  id,
}: {
  url: string;
  caption?: string;
  id: string;
}) => {
  return (
    <figure id={id} className="my-6">
      <img
        src={url}
        alt={caption || "Image"}
        className="w-full h-auto rounded-md"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-500 text-center">
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
      return <ParagraphBlock content={block.content} id={block.id} />;
    case "heading-1":
      return <HeadingBlock content={block.content} level={1} id={block.id} />;
    case "heading-2":
      return <HeadingBlock content={block.content} level={2} id={block.id} />;
    case "heading-3":
      return <HeadingBlock content={block.content} level={3} id={block.id} />;
    case "bulleted-list":
      return <ListBlock items={block.items} ordered={false} id={block.id} />;
    case "numbered-list":
      return <ListBlock items={block.items} ordered={true} id={block.id} />;
    case "code":
      return (
        <CodeBlock
          content={block.content}
          language={block.language}
          id={block.id}
        />
      );
    case "quote":
      return <QuoteBlock content={block.content} id={block.id} />;
    case "divider":
      return <DividerBlock id={block.id} />;
    case "image":
      return (
        <ImageBlock url={block.url} caption={block.caption} id={block.id} />
      );
    default:
      return null;
  }
};

export default BlockRenderer;
