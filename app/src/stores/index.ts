import { useReadingStore } from "./readingStore";
import { useDocumentStore } from "./documentStore";
import { useHistoryStore } from "./historyStore";
import { useCategoryStore } from "./categoryStore";
import { useEffect, useState } from "react";

/**
 * 🚀 Initializes all stores when the app starts
 * Gets everything ready to go!
 */
const useInit = () => {
  const [loading, setLoading] = useState(true);
  const readingInit = useReadingStore((state) => state.initialize);
  const documentInit = useDocumentStore((state) => state.initialize);
  const historyInit = useHistoryStore((state) => state.initialize);
  const categoryInit = useCategoryStore((state) => state.initialize);

  useEffect(() => {
    const init = async () => {
      await readingInit();
      await documentInit();
      await historyInit();
      await categoryInit();
      setLoading(false);
    };
    init();
  }, [readingInit, documentInit, historyInit, categoryInit]);

  return loading;
};

export { useReadingStore, useDocumentStore, useHistoryStore, useInit };
