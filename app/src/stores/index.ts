import { useReadingStore } from "./readingStore";
import { useDocumentStore } from "./documentStore";
import { useHistoryStore } from "./historyStore";
import { useCategoryStore } from "./categoryStore";
import { useActivityStore } from "./activityStore";
import { useHeatmapStore } from "./heatmapStore";
import { useEffect, useState } from "react";
import { useSectionStore } from "./sectionStore";
import { useCurrentDocumentStore } from "./currentDocumentStore";
import useReadingMetricsStore from "./document/readingMetrics";
import { databaseService } from "@/services/database/DatabaseService";

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
  const activityInit = useActivityStore((state) => state.initialize);
  const sectionInit = useSectionStore((state) => state.initialize);
  useEffect(() => {
    const init = async () => {
      await databaseService.initDatabase();
      await readingInit();
      await documentInit();
      await historyInit();
      await categoryInit();
      await activityInit();
      await sectionInit();
    };
    init().then(() => {
      setLoading(false);
    });
  }, [
    readingInit,
    documentInit,
    historyInit,
    categoryInit,
    activityInit,
    sectionInit,
  ]);

  return loading;
};

export {
  useReadingStore,
  useDocumentStore,
  useHistoryStore,
  useInit,
  useActivityStore,
  useHeatmapStore,
  useSectionStore,
  useCurrentDocumentStore,
  useReadingMetricsStore,
  useCategoryStore,
};
