// src/components/notion/DocumentViewer.tsx

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
      return format(date, "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Document header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4 text-primary">
          {document.title}
        </h1>
        <div className="flex items-center text-sm text-muted-foreground border-b border-border pb-4">
          <span className="inline-flex items-center">
            <svg
              className="w-4 h-4 mr-1 opacity-70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Created {formatDate(document.createdAt)}
          </span>
          <span className="mx-3">•</span>
          <span className="inline-flex items-center">
            <svg
              className="w-4 h-4 mr-1 opacity-70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Updated {formatDate(document.updatedAt)}
          </span>
        </div>
      </div>

      {/* Document content */}
      <div className="space-y-1">
        {document.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
};

export default DocumentViewer;
