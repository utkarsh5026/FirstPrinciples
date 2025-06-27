import getTopicIcon from "@/components/shared/icons/topic-icon";
import type { Category } from "@/services/document";

export const getCategoryIcon = (category: Category) => {
  return getTopicIcon(category.path);
};
