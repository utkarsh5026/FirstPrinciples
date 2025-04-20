import { useReadingStore } from "@/stores";
import { useMemo } from "react";

/**
 * 📚 A hook that organizes your reading list into neat categories!
 *
 * Helps you keep track of what you've finished and what's still on your
 * reading journey. Perfect for bookworms and knowledge seekers! 🤓✨
 */
const useDocumentList = () => {
  const todoList = useReadingStore((state) => state.todoList);
  const status = useReadingStore((state) => state.status);

  /**
   * 🎉 All the books you've conquered! Good job, reader!
   */
  const completed = useMemo(() => {
    return todoList.filter((item) => item.completed);
  }, [todoList]);

  /**
   * 📖 Books waiting for your attention - the adventure continues!
   */
  const pending = useMemo(() => {
    return todoList.filter((item) => !item.completed);
  }, [todoList]);

  return {
    pending,
    completed,
    status,
  };
};

export default useDocumentList;
