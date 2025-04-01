import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { Copy, Link } from "lucide-react";

interface CustomMarkdownRendererProps {
  markdown: string;
  className?: string;
}

const CustomMarkdownRenderer: React.FC<CustomMarkdownRendererProps> = ({
  markdown,
  className = "",
}) => {
  // Custom components to render each markdown element
  const components = {
    // Headings
    h1: ({ node, ...props }: any) => (
      <h1
        {...props}
        id={props.id}
        className="text-2xl font-medium mt-10 mb-4 text-white group flex items-center"
      >
        {props.children}
        <a
          href={`#${props.id}`}
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Link to section"
        >
          <Link size={16} className="text-gray-500 hover:text-primary" />
        </a>
      </h1>
    ),
    h2: ({ node, ...props }: any) => (
      <h2
        {...props}
        className="text-xl font-medium mt-8 mb-3 text-gray-100 group flex items-center"
      >
        {props.children}
        <a
          href={`#${props.id}`}
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Link to section"
        >
          <Link size={14} className="text-gray-500 hover:text-primary" />
        </a>
      </h2>
    ),
    h3: ({ node, ...props }: any) => (
      <h3
        {...props}
        className="text-lg font-medium mt-6 mb-3 text-gray-200 group flex items-center"
      >
        {props.children}
        <a
          href={`#${props.id}`}
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Link to section"
        >
          <Link size={12} className="text-gray-500 hover:text-primary" />
        </a>
      </h3>
    ),

    // Paragraphs
    p: ({ node, ...props }: any) => (
      <p {...props} className="text-gray-300 my-4 leading-7" />
    ),

    // Lists
    ul: ({ node, ...props }: any) => (
      <ul {...props} className="my-4 ml-6 list-disc space-y-2" />
    ),
    ol: ({ node, ...props }: any) => (
      <ol {...props} className="my-4 ml-6 list-decimal space-y-2" />
    ),
    li: ({ node, ...props }: any) => (
      <li {...props} className="pl-1 leading-7 text-gray-300" />
    ),

    // Blockquotes
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        {...props}
        className="border-l-2 border-gray-600 pl-4 my-6 py-1 text-gray-400 italic"
      />
    ),

    // Code blocks and inline code
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";

      // For inline code
      if (inline) {
        return (
          <code
            className="px-1.5 py-0.5 mx-0.5 bg-[#282c34] text-gray-300 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      }

      // For code blocks
      const [copied, setCopied] = React.useState(false);

      const copyToClipboard = () => {
        navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };

      return (
        <div className="my-6 rounded-md overflow-hidden border border-[#222222] relative">
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
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      );
    },

    // Tables
    table: ({ node, ...props }: any) => (
      <div className="my-6 overflow-x-auto">
        <table
          {...props}
          className="min-w-full divide-y divide-[#303030] border border-[#303030] rounded-md"
        />
      </div>
    ),
    thead: ({ node, ...props }: any) => (
      <thead {...props} className="bg-[#252525]" />
    ),
    tbody: ({ node, ...props }: any) => (
      <tbody {...props} className="divide-y divide-[#303030]" />
    ),
    tr: ({ node, ...props }: any) => (
      <tr {...props} className="hover:bg-[#242424]" />
    ),
    th: ({ node, ...props }: any) => (
      <th
        {...props}
        className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
      />
    ),
    td: ({ node, ...props }: any) => (
      <td {...props} className="px-4 py-3 text-sm text-gray-300" />
    ),

    // Horizontal rule
    hr: ({ node, ...props }: any) => (
      <hr {...props} className="my-8 border-t border-[#222222]" />
    ),

    // Links
    a: ({ node, ...props }: any) => (
      <a
        {...props}
        className="text-primary hover:underline"
        target={props.href.startsWith("http") ? "_blank" : undefined}
        rel={props.href.startsWith("http") ? "noopener noreferrer" : undefined}
      />
    ),

    // Images
    img: ({ node, ...props }: any) => (
      <img
        {...props}
        className="max-w-full h-auto rounded-md my-4"
        alt={props.alt || "Image"}
      />
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
