import React from "react";
import useMobile from "@/hooks/device/use-mobile";
interface PreviewPanelProps {
  excerpt: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ excerpt }) => {
  const { isMobile } = useMobile();
  const preview = isMobile ? excerpt.slice(0, 100) : excerpt;

  return (
    <div className="mb-8">
      <div className="text-foreground/90 leading-relaxed text-sm sm:text-base">
        <div className="bg-secondary/5 rounded-xl p-4 border border-border/30 relative shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/5 via-primary/20 to-primary/5 rounded-t-xl" />
          {preview}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
