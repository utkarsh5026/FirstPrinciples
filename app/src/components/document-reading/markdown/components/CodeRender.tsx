import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeRenderProps extends React.ComponentPropsWithoutRef<"code"> {
  inline?: boolean;
}

/**
 * CodeRender Component
 *
 * Renders code blocks and inline code with syntax highlighting and copy functionality.
 */
const CodeRender: React.FC<CodeRenderProps> = ({
  inline,
  className,
  children,
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className ?? "");
  const language = match ? match[1] : "";

  const codeRef = React.useRef<HTMLDivElement>(null);
  const [isInTableCell, setIsInTableCell] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      let parent = codeRef.current.parentElement;
      let cnt = 0;
      while (parent) {
        if (parent.tagName.toLowerCase().trim() === "td") {
          setIsInTableCell(true);
          return;
        }
        if (cnt === 3) break;
        parent = parent.parentElement;
        cnt++;
      }
      setIsInTableCell(false);
    }
  }, []);

  const codeContent =
    typeof children === "string"
      ? children.replace(/\n$/, "")
      : React.Children.toArray(children).join("");

  const isCompactCode =
    typeof codeContent === "string" &&
    !codeContent.includes("\n") &&
    codeContent.length < 25;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showSimpleCode = isInTableCell || (!inline && isCompactCode);

  return (
    <div ref={codeRef} className={cn(showSimpleCode && "inline")}>
      {showSimpleCode ? (
        <span className="inline-flex items-center" ref={codeRef}>
          <code className="px-2 py-1 text-primary text-sm font-cascadia-code">
            {codeContent}
          </code>
        </span>
      ) : (
        <div className="my-6 rounded-2xl overflow-hidden border border-[#222222] relative font-cascadia-code">
          <div className="bg-[#1c1c1c] text-gray-400 px-4 py-2 text-sm font-bold border-b border-[#222222] flex justify-between items-center">
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
            customStyle={{
              margin: 0,
              padding: "1rem",
              backgroundColor: "#1a1a1a",
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
            wrapLongLines={true}
            useInlineStyles={true}
            codeTagProps={{
              style: {
                backgroundColor: "transparent",
                fontFamily: "Fira Code",
              },
            }}
            {...props}
            style={{
              ...oneDark,
              'pre[class*="language-"]': {
                ...oneDark['pre[class*="language-"]'],
                background: "transparent",
              },
              'code[class*="language-"]': {
                ...oneDark['code[class*="language-"]'],
                background: "transparent",
              },
            }}
          >
            {typeof children === "string"
              ? children.replace(/\n$/, "")
              : React.Children.toArray(children).join("")}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};

export default CodeRender;
