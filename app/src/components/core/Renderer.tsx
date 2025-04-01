// src/components/notion/NotionApp.tsx

import React, { useState, useEffect } from "react";
import DocumentViewer from "./DocumentViewer";
import { sampleDocument } from "@/concepts/data";
import { Sun, Moon } from "lucide-react";

/**
 * A Notion-like read-only document viewer application
 */
const NotionApp: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Apply dark mode on component mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Toggle dark mode class on the document body
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 font-sans">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold tracking-tight">NotionLike</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-secondary/70 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="hidden md:block col-span-1">
            <div className="sticky top-20 p-5 border border-border rounded-lg bg-card text-card-foreground">
              <h2 className="text-lg font-medium mb-4 pb-2 border-b border-border">
                Contents
              </h2>
              <nav className="space-y-1">
                {sampleDocument.blocks
                  .filter((block) => block.type.startsWith("heading"))
                  .map((block, index) => {
                    // Determine indentation based on heading level
                    const indentClass =
                      block.type === "heading-1"
                        ? "ml-0 font-medium"
                        : block.type === "heading-2"
                        ? "ml-3 text-muted-foreground"
                        : "ml-6 text-muted-foreground/80";

                    return (
                      <a
                        key={block.id}
                        href={`#${block.id}`}
                        className={`block py-1 text-sm hover:text-primary transition-colors ${indentClass}`}
                      >
                        {(block as any).content}
                      </a>
                    );
                  })}
              </nav>
            </div>
          </div>

          {/* Document content */}
          <div className="col-span-1 md:col-span-3">
            <div className="bg-card text-card-foreground p-6 sm:p-8 rounded-lg border border-border shadow-sm">
              <DocumentViewer document={sampleDocument} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
          <p className="text-sm text-muted-foreground text-center">
            NotionLike Interface — Built with React, TypeScript, and Tailwind
            CSS
          </p>
          <div className="flex justify-center mt-4 space-x-4">
            <span className="px-3 py-1 text-xs rounded-full bg-secondary/50 text-muted-foreground">
              React 19
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-secondary/50 text-muted-foreground">
              TypeScript
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-secondary/50 text-muted-foreground">
              Tailwind 4
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotionApp;
