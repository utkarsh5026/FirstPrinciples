import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useCodeSettingsStore } from "../../../store/code-settings-store";
import useCodeSettings from "../../../hooks/use-code-settings";

interface CodeDisplayProps {
  isDrawer?: boolean;
  ref?: React.RefObject<HTMLDivElement | null>;
  language: string;
  codeContent: string;
  props?: React.ComponentPropsWithoutRef<typeof SyntaxHighlighter>;
  themeStyle: Record<string, React.CSSProperties>;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  isDrawer = false,
  ref,
  language,
  codeContent,
  props,
  themeStyle,
}) => {
  const settings = useCodeSettingsStore((state) => state.settings);
  const { getFontFamily, getFontSize, getPadding, getBackgroundStyle } =
    useCodeSettings();

  const shouldWrapLines = settings.enableWordWrap;

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
            padding: getPadding(isDrawer),
            fontSize: getFontSize(isDrawer),
            lineHeight: settings.lineHeight,
            minWidth: "100%",
            width: shouldWrapLines ? "100%" : "max-content",
            backgroundColor: getBackgroundStyle(themeStyle),
            border: "none",
            fontFamily: getFontFamily(),
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
              backgroundColor: getBackgroundStyle(themeStyle),
              background: getBackgroundStyle(themeStyle),
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
