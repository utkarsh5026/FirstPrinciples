import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useCodeSettingsStore } from "../../../store/code-settings-store";

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
  const { settings } = useCodeSettingsStore();

  // Font family mapping
  const getFontFamily = () => {
    const fontMap = {
      "source-code-pro": "Source Code Pro, monospace",
      "fira-code": "Fira Code, monospace",
      "cascadia-code": "Cascadia Code, monospace",
      "jetbrains-mono": "JetBrains Mono, monospace",
      "sf-mono": "SF Mono, monospace",
      consolas: "Consolas, monospace",
      monaco: "Monaco, monospace",
      "ubuntu-mono": "Ubuntu Mono, monospace",
      "roboto-mono": "Roboto Mono, monospace",
    };
    return fontMap[settings.fontFamily] || "Source Code Pro, monospace";
  };

  // Font size mapping
  const getFontSize = () => {
    if (isDrawer) {
      const sizeMap = {
        xs:
          window.innerWidth >= 1536
            ? "0.75rem"
            : window.innerWidth >= 1280
            ? "0.7rem"
            : "0.65rem",
        sm:
          window.innerWidth >= 1536
            ? "0.85rem"
            : window.innerWidth >= 1280
            ? "0.8rem"
            : "0.75rem",
        base:
          window.innerWidth >= 1536
            ? "0.95rem"
            : window.innerWidth >= 1280
            ? "0.9rem"
            : "0.85rem",
        lg:
          window.innerWidth >= 1536
            ? "1.05rem"
            : window.innerWidth >= 1280
            ? "1rem"
            : "0.95rem",
        xl:
          window.innerWidth >= 1536
            ? "1.15rem"
            : window.innerWidth >= 1280
            ? "1.1rem"
            : "1.05rem",
      };
      return sizeMap[settings.fontSize];
    } else {
      const sizeMap = {
        xs: window.innerWidth < 640 ? "0.6rem" : "0.65rem",
        sm: window.innerWidth < 640 ? "0.7rem" : "0.75rem",
        base: window.innerWidth < 640 ? "0.8rem" : "0.85rem",
        lg: window.innerWidth < 640 ? "0.9rem" : "0.95rem",
        xl: window.innerWidth < 640 ? "1rem" : "1.05rem",
      };
      return sizeMap[settings.fontSize];
    }
  };

  const getPadding = () => {
    if (settings.compactMode) {
      return isDrawer ? "1rem" : "0.5rem";
    }
    if (isDrawer) {
      if (window.innerWidth >= 1536) return "3rem";
      if (window.innerWidth >= 1280) return "2.5rem";
      if (window.innerWidth >= 1024) return "2rem";
      return "1.5rem";
    }
    return window.innerWidth < 640 ? "0.75rem" : "1rem";
  };

  const getLineHeight = () => settings.lineHeight;

  // Determine if word wrap should be enabled
  const shouldWrapLines = lineWrap || settings.enableWordWrap;

  // Background style
  const getBackgroundStyle = () => {
    if (settings.transparentBackground) {
      return "transparent";
    }
    return (
      settings.customBackground ||
      themeStyle['pre[class*="language-"]']?.backgroundColor ||
      "transparent"
    );
  };

  return (
    <div
      ref={ref}
      className={cn(
        isDrawer && "relative code-capture-container",
        !settings.transparentBackground && "bg-muted/5 rounded-b-2xl"
      )}
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
          showLineNumbers={settings.showLineNumbers}
          customStyle={{
            margin: 0,
            padding: getPadding(),
            fontSize: getFontSize(),
            lineHeight: getLineHeight(),
            minWidth: "100%",
            width: shouldWrapLines ? "100%" : "max-content",
            backgroundColor: getBackgroundStyle(),
            border: "none",
            fontFamily: getFontFamily(),
            // These properties help with image capture and line wrapping
            maxWidth: shouldWrapLines ? "100%" : "none",
            whiteSpace: shouldWrapLines ? "pre-wrap" : "pre",
            wordWrap: shouldWrapLines ? "break-word" : "normal",
            overflow: "visible",
            wordBreak: shouldWrapLines ? "break-word" : "normal",
          }}
          useInlineStyles={true}
          codeTagProps={{
            style: {
              backgroundColor: "transparent",
              fontFamily: getFontFamily(),
              whiteSpace: shouldWrapLines ? "pre-wrap" : "pre",
              fontSize: "inherit",
              overflow: "visible",
              maxWidth: shouldWrapLines ? "100%" : "none",
              wordWrap: shouldWrapLines ? "break-word" : "normal",
              wordBreak: shouldWrapLines ? "break-word" : "normal",
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
              maxWidth: shouldWrapLines ? "100%" : "none",
              whiteSpace: shouldWrapLines ? "pre-wrap" : "pre",
              wordWrap: shouldWrapLines ? "break-word" : "normal",
              wordBreak: shouldWrapLines ? "break-word" : "normal",
              fontFamily: getFontFamily(),
            },
            'pre[class*="language-"]': {
              ...themeStyle['pre[class*="language-"]'],
              backgroundColor: getBackgroundStyle(),
              background: getBackgroundStyle(),
              overflow: "visible",
              maxWidth: shouldWrapLines ? "100%" : "none",
              whiteSpace: shouldWrapLines ? "pre-wrap" : "pre",
              wordWrap: shouldWrapLines ? "break-word" : "normal",
              wordBreak: shouldWrapLines ? "break-word" : "normal",
              fontFamily: getFontFamily(),
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
