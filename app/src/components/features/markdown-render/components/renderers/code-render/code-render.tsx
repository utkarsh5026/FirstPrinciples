import React, { useState, useRef, useMemo } from "react";
import { Copy, Check, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import getIconForTech from "@/components/shared/icons/";
import { useCodeThemeStore } from "@/components/features/markdown-render/store/code-theme-store";
import { Button } from "@/components/ui/button";
import CodePreviewDrawer from "./code-preview-drawer";
import CodeDisplay from "./code-display";
import { useCodeDetection } from "../../../hooks/use-code-detection";
import { useCodeActions } from "../../../hooks/use-code-actions";

interface CodeRenderProps extends React.ComponentPropsWithoutRef<"code"> {
  inline?: boolean;
}

const getHeadingCodeStyle = (headingLevel: number | null) => {
  if (!headingLevel) return "text-sm sm:text-base";
  const sizes = {
    1: "text-xl sm:text-3xl",
    2: "text-lg sm:text-2xl",
    3: "text-base sm:text-xl",
  };
  return `${
    sizes[headingLevel as keyof typeof sizes]
  } mx-1 sm:mx-2 px-2 py-1 bg-primary/10 rounded-xl sm:rounded-2xl`;
};

const CodeRender: React.FC<CodeRenderProps> = ({
  inline,
  className,
  children,
  ...props
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const match = /language-(\w+)/.exec(className ?? "");
  const language = match ? match[1] : "";
  const { getCurrentThemeStyle } = useCodeThemeStore();

  const codeRef = useRef<HTMLDivElement>(null);
  const drawerCodeRef = useRef<HTMLDivElement | null>(null);

  const codeContent = useMemo(() => {
    return typeof children === "string"
      ? children.replace(/\n$/, "")
      : React.Children.toArray(children).join("");
  }, [children]);

  const { isInTableCell, headingLevel } = useCodeDetection(codeRef);
  const {
    copied,
    downloading,
    copyToClipboard,
    handleDownloadAsImage,
    handleDownloadAsFile,
  } = useCodeActions(codeContent, language, drawerCodeRef);

  const isCompactCode =
    typeof codeContent === "string" &&
    !codeContent.includes("\n") &&
    codeContent.length < 25;

  const isLargeCode =
    typeof codeContent === "string" &&
    (codeContent.split("\n").length > 20 || codeContent.length > 500);

  const showSimpleCode = isInTableCell || (!inline && isCompactCode);

  if (showSimpleCode) {
    return (
      <span ref={codeRef}>
        <code
          className={cn(
            "px-2 py-1 text-primary font-cascadia-code break-words",
            getHeadingCodeStyle(headingLevel)
          )}
        >
          {codeContent}
        </code>
      </span>
    );
  }

  return (
    <div
      ref={codeRef}
      className="my-8 relative font-fira-code no-swipe shadow-background/50 rounded-2xl border-none"
    >
      <CodeHeader
        language={language}
        copied={copied}
        copyToClipboard={copyToClipboard}
        setDrawerOpen={setDrawerOpen}
      />

      {/* Code Content - Remove CollapsibleContent wrapper */}
      <div className="rounded-2xl">
        {isLargeCode ? (
          /* Preview for large code blocks */
          <div
            className="relative cursor-pointer group"
            onClick={() => setDrawerOpen(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="ghost"
                size="sm"
                className="bg-background/90 backdrop-blur-sm border-primary/20 hover:bg-primary/10 rounded-2xl"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                View Full Code
              </Button>
            </div>
            <div className="overflow-hidden relative max-h-[300px] rounded-2xl">
              <CodeDisplay
                language={language}
                codeContent={codeContent}
                themeStyle={getCurrentThemeStyle()}
                props={{ ...props }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
            </div>
          </div>
        ) : (
          /* Regular code display for smaller blocks */
          <CodeDisplay
            language={language}
            codeContent={codeContent}
            themeStyle={getCurrentThemeStyle()}
            props={{ ...props }}
          />
        )}
      </div>

      {/* Code Preview Drawer */}
      <CodePreviewDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        language={language}
        codeContent={codeContent}
        onDownloadAsImage={handleDownloadAsImage}
        onDownloadAsFile={handleDownloadAsFile}
        downloading={downloading}
        onCopy={copyToClipboard}
        copied={copied}
        drawerCodeRef={drawerCodeRef}
        props={props}
        themeStyle={getCurrentThemeStyle()}
      />
    </div>
  );
};

interface CodeHeaderProps {
  language: string;
  copied: boolean;
  copyToClipboard: () => void;
  setDrawerOpen: (open: boolean) => void;
}

const CodeHeader: React.FC<CodeHeaderProps> = ({
  language,
  copied,
  copyToClipboard,
  setDrawerOpen,
}) => {
  return (
    <div className="bg-card text-muted-foreground px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold border-b border-border flex justify-between items-center rounded-t-2xl">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
        <span className="flex-shrink-0">
          {(() => {
            const IconComponent = getIconForTech(language || "code");
            return (
              <span className="flex items-center gap-1">
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{language}</span>
              </span>
            );
          })()}
        </span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Copy Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-8 px-2 transition-all duration-300 cursor-pointer"
          aria-label={copied ? "Copied!" : "Copy code"}
        >
          <div className="relative">
            <Copy
              size={14}
              className={cn(
                "transition-all duration-300",
                copied
                  ? "opacity-0 scale-0 rotate-90"
                  : "opacity-100 scale-100 rotate-0"
              )}
            />
            <Check
              size={14}
              className={cn(
                "absolute inset-0 transition-all duration-300 text-green-400",
                copied
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-0 -rotate-90"
              )}
            />
          </div>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 cursor-pointer"
          aria-label="Open in drawer"
          onClick={() => setDrawerOpen(true)}
        >
          <Maximize2 size={14} />
        </Button>
      </div>
    </div>
  );
};

export default CodeRender;
