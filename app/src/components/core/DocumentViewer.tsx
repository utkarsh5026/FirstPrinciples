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
      {/* Minimal document header with reduced contrast */}
      <div className="mb-8">
        <h1 className="text-3xl font-normal mb-3 text-gray-200 leading-tight">
          {document.title}
        </h1>
        <div className="text-sm text-gray-500 border-b border-[#303030] pb-3">
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
