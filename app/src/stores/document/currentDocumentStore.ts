import { create } from "zustand";
import { LoadingWithError } from "../base/base";
import { parseError } from "@/utils/error";
import { MarkdownSection } from "@/services/section/parsing";
import { markdownWorkerManager } from "@/infrastructure/workers/markdown/markdown-worker-manager";
import { getFilenameFromPath, loadMarkdownContent } from "@/services/document";

type State = LoadingWithError & {
  markdown: string;
  title: string;
  category: string;
  sections: MarkdownSection[];
  docPath: string;
  metrics: {
    totalWords: number;
    totalTime: number;
    totalSections: number;
  };
};

type Actions = {
  load(documentUrl: string): Promise<void>;
};

export const useCurrentDocumentStore = create<State & Actions>((set) => ({
  markdown: "",
  title: "",
  category: "",
  sections: [],
  docPath: "",
  metrics: {
    totalWords: 0,
    totalTime: 0,
    totalSections: 0,
  },
  loading: false,
  error: null,

  load: async (documentUrl: string) => {
    set({ loading: true, error: null });
    const loadedDocument = await loadMarkdownContent(documentUrl);
    if (!loadedDocument) {
      set({ loading: false, error: "Failed to load markdown" });
      return;
    }

    const { content: markdown } = loadedDocument;
    const category = documentUrl.split("/")[0].toLowerCase();

    try {
      const sections = await markdownWorkerManager.parseMarkdown(markdown);

      const totalWords = sections.reduce(
        (acc, section) => acc + section.wordCount,
        0
      );

      const totalTime = await markdownWorkerManager.estimateReadingTime(
        totalWords
      );

      set({
        title: getFilenameFromPath(documentUrl),
        markdown,
        docPath: documentUrl,
        category,
        sections,
        metrics: { totalWords, totalTime, totalSections: sections.length },
        loading: false,
        error: null,
      });
    } catch (error) {
      set({ loading: false, error: parseError(error) });
    }
  },
}));
