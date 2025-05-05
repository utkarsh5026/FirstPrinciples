import { useReadingHistory, useReadingList, useDocumentList } from "@/hooks";
import { useEffect, useMemo, useState } from "react";
import { FileMetadata } from "@/services/document";

export type NavigationFileItem = FileMetadata & {
  depth: number;
  isCurrentFile: boolean;
  isTodo: boolean;
  isCompleted: boolean;
  isRead: boolean;
};

export type CurrentCategory = {
  name: string;
  root: string;
  files: NavigationFileItem[];
};

/**
 * 🧭 Navigation Hook
 *
 * Helps you find your way around documents! Keeps track of what you've read,
 * what's on your to-do list, and what you're currently looking at.
 */
const useNavigation = (currentFilePath?: string) => {
  const { history } = useReadingHistory();
  const { todoList } = useReadingList();
  const { fileMap, contentIndex } = useDocumentList();
  const [currentOpen, setCurrentOpen] = useState<CurrentCategory | null>(null);

  /**
   * 📚 Tracks documents you've already read
   */
  const readFilePaths = useMemo(() => {
    const readPaths = new Set<string>();
    history.forEach(({ path }) => {
      const withMdPath = path.endsWith(".md") ? path : `${path}.md`;
      readPaths.add(withMdPath);
    });
    return readPaths;
  }, [history]);

  /**
   * 📋 Organizes your reading tasks
   */
  const { todo, completed } = useMemo(() => {
    const todoPaths = new Set(
      todoList.filter(({ completed }) => !completed).map(({ path }) => path)
    );

    const completedPaths = new Set(
      todoList.filter(({ completed }) => completed).map(({ path }) => path)
    );

    return { todo: todoPaths, completed: completedPaths };
  }, [todoList]);

  /**
   * 🔍 Finds and highlights your current location
   */
  useEffect(() => {
    if (!currentFilePath || !contentIndex.categories) {
      return;
    }

    const [root, immediate] = currentFilePath.split("/");
    const category = contentIndex.categories.find(({ id }) => id === root);
    if (category) {
      const immediateParent = category.categories?.find(
        ({ id }) => id === immediate
      );
      if (immediateParent) {
        setCurrentOpen({
          name: immediateParent.name,
          root,
          files:
            immediateParent.files?.map((file) => ({
              ...file,
              depth: 0,
              isCurrentFile: file.path === currentFilePath,
              isTodo: todo.has(file.path),
              isCompleted: completed.has(file.path),
              isRead: readFilePaths.has(file.path),
            })) ?? [],
        });
      }
    }
  }, [
    currentFilePath,
    contentIndex.categories,
    todo,
    completed,
    readFilePaths,
  ]);

  return {
    readFilePaths,
    todo,
    completed,
    documentsCount: Object.keys(fileMap).length,
    currentOpen,
  };
};

export default useNavigation;
