interface PreviewPanelProps {
  excerpt: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ excerpt }) => {
  return (
    <div className="mb-8">
      <div className="text-foreground/90 leading-relaxed text-sm sm:text-base">
        <div className="bg-secondary/5 rounded-xl p-4 border border-border/30 relative shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/5 via-primary/20 to-primary/5 rounded-t-xl" />
          {excerpt || "Preview not available for this document."}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
