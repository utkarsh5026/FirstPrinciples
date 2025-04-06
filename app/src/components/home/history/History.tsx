import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Calendar,
  FileText,
  ChevronRight,
} from "lucide-react";
import type { ReadingHistoryItem } from "../types";

interface HistoryProps {
  readingHistory: ReadingHistoryItem[];
  handleSelectDocument: (path: string, title: string) => void;
  handleExploreDocuments: () => void;
  handleClearHistory: () => void;
}

/**
 * Format date for display
 */
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();

  // If today, show time
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // If yesterday, show "Yesterday"
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // Otherwise, show date
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
  });
};

const History: React.FC<HistoryProps> = ({
  readingHistory,
  handleSelectDocument,
  handleClearHistory,
  handleExploreDocuments,
}) => {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <h2 className="text-lg font-medium flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary" />
          Reading History
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track your reading progress across the documentation
        </p>
      </div>

      {readingHistory.length > 0 ? (
        <ScrollArea className="h-[400px] md:h-[500px] pr-4">
          <div className="p-5 space-y-3">
            {readingHistory.map((item) => (
              <button
                key={item.path}
                className="w-full text-left p-3 rounded-lg hover:bg-primary/5 border border-border/40 hover:border-primary/20 transition-all flex items-center gap-3 group"
                onClick={() => handleSelectDocument(item.path, item.title)}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium truncate">{item.title}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1 inline" />
                    <span>{formatDate(item.lastReadAt)}</span>
                    {item.readCount > 1 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 text-[10px] h-4"
                      >
                        Read {item.readCount}×
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 opacity-50" />
          </div>
          <p className="text-base font-medium">No reading history yet</p>
          <p className="text-sm mt-1 mb-6">
            Documents you read will appear here
          </p>
          <Button
            variant="outline"
            className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
            onClick={handleExploreDocuments}
          >
            Explore documents
          </Button>
        </div>
      )}

      {readingHistory.length > 0 && (
        <div className="px-5 py-3 border-t border-border flex justify-between items-center bg-card">
          <p className="text-sm text-muted-foreground">
            {readingHistory.length}{" "}
            {readingHistory.length === 1 ? "document" : "documents"} in history
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive h-8 hover:bg-destructive/10"
            onClick={() => {
              if (
                confirm("Are you sure you want to clear your reading history?")
              ) {
                handleClearHistory();
              }
            }}
          >
            Clear history
          </Button>
        </div>
      )}
    </div>
  );
};

export default History;
