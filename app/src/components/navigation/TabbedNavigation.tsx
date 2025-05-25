import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, FolderTree } from "lucide-react";
import CurrentlyReading from "./currenty-reading/CurrentlyReading";
import DocumentTree from "./documents/DocumentTree";
import { CurrentCategory } from "./hooks/use-navigate";
import type { Document } from "@/stores/document/document-store";
import { motion } from "framer-motion";
import TodayReading from "./today-reading/TodayReading";

interface TabbedNavigationProps {
  currentCategory: CurrentCategory | null;
  currentFilePath: string;
  onFileSelect: (filePath: string) => void;
  filePaths: {
    read: Set<string>;
    todo: Set<string>;
    completed: Set<string>;
  };
  handleToggleExpand: (categoryId: string, isExpanded: boolean) => void;
  loading: boolean;
  categoryData: {
    tree: Document[];
    expanded: Set<string>;
    current: CurrentCategory | null;
  };
}

const TabbedNavigation: React.FC<TabbedNavigationProps> = ({
  currentCategory,
  currentFilePath,
  onFileSelect,
  filePaths,
  handleToggleExpand,
  loading,
  categoryData,
}) => {
  const tabs = [
    {
      value: "reading",
      label: "Reading",
    },
    {
      value: "documents",
      label: "Documents",
    },
    {
      value: "history",
      label: "Today's Activity",
    },
  ];

  return (
    <Tabs
      defaultValue="reading"
      className="w-full h-full flex flex-col font-type-mono"
    >
      <div className="w-full p-4">
        <TabsList className="w-full font-cascadia-code border border-border/20 rounded-2xl">
          {tabs.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary rounded-2xl border-none px-2 py-1 break-words"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="reading">
        <ScrollArea className="flex-1 px-1 mt-4">
          <div className="px-4 pb-6">
            {!loading && currentCategory && (
              <CurrentlyReading
                currentCategory={currentCategory}
                currentFilePath={currentFilePath ?? ""}
                onSelectFile={onFileSelect}
              />
            )}

            {(!currentCategory || currentCategory.files.length === 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border/20 shadow-sm rounded-xl p-6 text-center"
              >
                <div className="bg-primary/5 p-3 rounded-full inline-block mb-3">
                  <BookOpen size={28} className="text-primary" />
                </div>
                <h4 className="text-sm font-medium mb-2">No Active Reading</h4>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-3">
                  You don't have any documents currently being read.
                </p>
                <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  <FolderTree size={12} className="mr-1.5" />
                  Select a document to start reading
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent
        value="documents"
        className="flex-1 mt-0 data-[state=active]:flex flex-col"
      >
        <ScrollArea className="flex-1 px-1">
          <div className="px-3 pt-2 pb-6">
            <DocumentTree
              categoryData={categoryData}
              loading={loading}
              onFileSelect={onFileSelect}
              filePaths={filePaths}
              currentFilePath={currentFilePath}
              handleToggleExpand={handleToggleExpand}
            />
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent
        value="history"
        className="flex-1 mt-0 data-[state=active]:flex flex-col"
      >
        <ScrollArea className="flex-1 px-1">
          <TodayReading onFileSelect={onFileSelect} />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

export default TabbedNavigation;
