import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeRenderProps extends React.ComponentPropsWithoutRef<"code"> {
  inline?: boolean;
}

const getHeadingCodeStyle = (headingLevel: number | null) => {
  if (!headingLevel) return "text-sm";
  const sizes = {
    1: "text-3xl",
    2: "text-2xl",
    3: "text-xl",
  };
  return `${
    sizes[headingLevel as keyof typeof sizes]
  } mx-2  bg-primary/10 rounded-2xl`;
};

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
  const [headingLevel, setHeadingLevel] = useState<number | null>(null);

  console.log(headingLevel);

  useEffect(() => {
    if (codeRef.current) {
      let parent = codeRef.current.parentElement;
      let cnt = 0;
      while (parent) {
        const tagName = parent.tagName.toLowerCase().trim();
        if (tagName === "td") {
          setIsInTableCell(true);
          return;
        }

        if (tagName === "h1" || tagName === "h2" || tagName === "h3") {
          setHeadingLevel(parseInt(tagName.slice(1)));
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

  return showSimpleCode ? (
    <span ref={codeRef}>
      <code
        className={cn(
          "px-2 py-1 text-primary font-cascadia-code",
          getHeadingCodeStyle(headingLevel)
        )}
      >
        {codeContent}
      </code>
    </span>
  ) : (
    <div ref={codeRef} className="my-6 relative font-fira-code no-swipe">
      <div className="bg-[#1c1c1c] text-gray-400 px-4 py-2 text-sm font-bold border-b border-[#222222] flex justify-between items-center rounded-t-2xl">
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

      <div
        className="overflow-x-auto overflow-y-hidden
                   [&::-webkit-scrollbar]:h-2 
                   [&::-webkit-scrollbar-track]:bg-[#0f0f0f] 
                   [&::-webkit-scrollbar-track]:rounded-full 
                   [&::-webkit-scrollbar-track]:border-t 
                   [&::-webkit-scrollbar-track]:border-[#222222]
                   [&::-webkit-scrollbar-thumb]:bg-gradient-to-r 
                   [&::-webkit-scrollbar-thumb]:from-[#404040] 
                   [&::-webkit-scrollbar-thumb]:to-[#505050] 
                   [&::-webkit-scrollbar-thumb]:rounded-full 
                   [&::-webkit-scrollbar-thumb]:border 
                   [&::-webkit-scrollbar-thumb]:border-[#2a2a2a]
                   [&::-webkit-scrollbar-thumb:hover]:from-[#555555] 
                   [&::-webkit-scrollbar-thumb:hover]:to-[#666666]
                   [&::-webkit-scrollbar-thumb:hover]:border-[#777777]
                   [&::-webkit-scrollbar-thumb:active]:from-[#666666] 
                   [&::-webkit-scrollbar-thumb:active]:to-[#777777]"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#505050 #0f0f0f",
        }}
      >
        <SyntaxHighlighter
          language={language || "text"}
          customStyle={{
            margin: 0,
            padding: "1rem",
            backgroundColor: "#1a1a1a",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            minWidth: "100%",
            width: "max-content",
          }}
          useInlineStyles={true}
          codeTagProps={{
            style: {
              backgroundColor: "transparent",
              fontFamily: "Source Code Pro, monospace",
              whiteSpace: "pre",
            },
          }}
          {...props}
          style={{
            ...oneDark,
            'pre[class*="language-"]': {
              ...oneDark['pre[class*="language-"]'],
              background: "transparent",
              overflow: "visible",
              margin: 0,
            },
            'code[class*="language-"]': {
              ...oneDark['code[class*="language-"]'],
              background: "transparent",
              whiteSpace: "pre",
            },
          }}
        >
          {typeof children === "string"
            ? children.replace(/\n$/, "")
            : React.Children.toArray(children).join("")}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeRender;
