// src/components/core/DocumentViewer.tsx

import React from "react";
import BlockRenderer from "./BlockRenderer";
import { Document } from "@/components/core/type";
import { format } from "date-fns";

interface DocumentViewerProps {
  document: Document;
  className?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  className = "",
}) => {
  // Format dates for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={`max-w-3xl mx-auto ${className}`}>
      {/* Minimal document header */}
      <div className="mb-8">
        <h1 className="text-3xl font-medium mb-3 text-white leading-tight">
          {document.title}
        </h1>
        <div className="text-sm text-gray-400 border-b border-[#222222] pb-3">
          Created {formatDate(document.createdAt)} · Updated{" "}
          {formatDate(document.updatedAt)}
        </div>
      </div>

      {/* Document content with optimized spacing for better reading */}
      <div className="space-y-1">
        {document.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
};

export default DocumentViewer;
