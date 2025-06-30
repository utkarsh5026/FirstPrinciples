import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

interface CodeDisplayProps {
  isDrawer?: boolean;
  ref?: React.RefObject<HTMLDivElement | null>;
  language: string;
  codeContent: string;
  props?: React.ComponentPropsWithoutRef<typeof SyntaxHighlighter>;
  themeStyle: Record<string, React.CSSProperties>;
  lineWrap?: boolean;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  isDrawer = false,
  ref,
  language,
  codeContent,
  props,
  themeStyle,
  lineWrap = false,
}) => {
  const getPadding = () => {
    if (isDrawer) {
      if (window.innerWidth >= 1536) return "3rem";
      if (window.innerWidth >= 1280) return "2.5rem";
      if (window.innerWidth >= 1024) return "2rem";
      return "1.5rem";
    }
    return window.innerWidth < 640 ? "0.75rem" : "1rem";
  };

  const getFontSize = () => {
    if (isDrawer) {
      if (window.innerWidth >= 1536) return "0.95rem";
      if (window.innerWidth >= 1280) return "0.9rem";
      if (window.innerWidth >= 1024) return "0.85rem";
      return "0.8rem";
    }
    return window.innerWidth < 640 ? "0.7rem" : "0.75rem";
  };

  const getLineHeight = () => {
    if (isDrawer) {
      return window.innerWidth >= 1024 ? 1.8 : 1.7;
    }
    return window.innerWidth < 640 ? 1.5 : 1.6;
  };

  return (
    <div
      ref={ref}
      className={cn(isDrawer && "relative code-capture-container")}
    >
      <ScrollArea
        className={cn(
          "rounded-b-2xl border-none",
          isDrawer &&
            "max-h-[70vh] lg:max-h-[75vh] xl:max-h-[80vh] code-scroll-area"
        )}
      >
        <SyntaxHighlighter
          language={language ?? "text"}
          customStyle={{
            margin: 0,
            padding: getPadding(),
            fontSize: getFontSize(),
            lineHeight: getLineHeight(),
            minWidth: "100%",
            width: lineWrap ? "100%" : "max-content",
            backgroundColor: "transparent",
            border: "none",
            // These properties help with image capture and line wrapping
            maxWidth: lineWrap ? "100%" : "none",
            whiteSpace: lineWrap ? "pre-wrap" : "pre",
            wordWrap: lineWrap ? "break-word" : "normal",
            overflow: "visible",
            wordBreak: lineWrap ? "break-word" : "normal",
          }}
          useInlineStyles={true}
          codeTagProps={{
            style: {
              backgroundColor: "transparent",
              fontFamily: "Source Code Pro, monospace",
              whiteSpace: lineWrap ? "pre-wrap" : "pre",
              fontSize: "inherit",
              overflow: "visible",
              maxWidth: lineWrap ? "100%" : "none",
              wordWrap: lineWrap ? "break-word" : "normal",
              wordBreak: lineWrap ? "break-word" : "normal",
            },
          }}
          {...props}
          style={{
            ...themeStyle,
            'code[class*="language-"]': {
              ...themeStyle['code[class*="language-"]'],
              backgroundColor: "transparent",
              background: "transparent",
              overflow: "visible",
              maxWidth: lineWrap ? "100%" : "none",
              whiteSpace: lineWrap ? "pre-wrap" : "pre",
              wordWrap: lineWrap ? "break-word" : "normal",
              wordBreak: lineWrap ? "break-word" : "normal",
            },
            'pre[class*="language-"]': {
              ...themeStyle['pre[class*="language-"]'],
              backgroundColor: "transparent",
              background: "transparent",
              overflow: "visible",
              maxWidth: lineWrap ? "100%" : "none",
              whiteSpace: lineWrap ? "pre-wrap" : "pre",
              wordWrap: lineWrap ? "break-word" : "normal",
              wordBreak: lineWrap ? "break-word" : "normal",
            },
          }}
        >
          {String(codeContent)}
        </SyntaxHighlighter>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CodeDisplay;
