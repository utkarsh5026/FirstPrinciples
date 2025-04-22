import { useDocumentStore } from "@/stores";

/**
 * 📚 A hook that organizes your reading list into neat categories!
 *
 * Helps you keep track of what you've finished and what's still on your
 * reading journey. Perfect for bookworms and knowledge seekers! 🤓✨
 */
const useDocumentList = () => {
  const documents = useDocumentStore((state) => state.availableDocuments);
  const contentIndex = useDocumentStore((state) => state.contentIndex);

  return {
    documents,
    contentIndex,
  };
};

export default useDocumentList;
