import React from "react";
import { BookMarked, ListTodo, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTabContext } from "@/components/home/context/TabContext";
import getIconForTech from "@/components/icons";
import { useReadingStore } from "@/stores";
import { formatDate } from "@/components/home/utils";
import CardContainer from "@/components/container/CardContainer";

interface UpcomingReadsProps {
  handleSelectDocument: (path: string, title: string) => void;
  setShowAddTodoModal: () => void;
}

/**
 * UpcomingReads - A delightful component that showcases your upcoming reading list! 📚✨
 *
 * This component displays a list of books or documents that you plan to read in the future.
 * It provides a user-friendly interface to manage your reading list, allowing you to mark items as read
 * and select documents for more details. 🌟
 *
 * The component also features a button to add new items to your reading list, making it easy to keep
 * track of what you want to read next! 📝💖
 *
 * If your reading list is empty, it gently reminds you to add documents you want to read later.
 * The layout is designed to be visually appealing and responsive, ensuring a smooth experience
 * across different devices. 🌈📱
 */
const UpcomingReads: React.FC<UpcomingReadsProps> = ({
  handleSelectDocument,
  setShowAddTodoModal,
}) => {
  const { setActiveTab } = useTabContext();
  const todoList = useReadingStore((state) => state.todoList);
  const toggleTodoCompletion = useReadingStore(
    (state) => state.toggleTodoCompletion
  );

  return (
    <CardContainer
      title="Upcoming Reads"
      description="Add documents you want to read later"
      icon={BookMarked}
      variant="subtle"
      headerAction={
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
          onClick={setShowAddTodoModal}
        >
          <ListTodo className="h-3 w-3 mr-1.5" />
          Add
        </Button>
      }
    >
      {todoList.filter((item) => !item.completed).length > 0 ? (
        <div className="space-y-2">
          {todoList
            .filter((item) => !item.completed)
            .slice(0, 6)
            .map(({ id, path, title, addedAt }) => {
              const category = path.split("/")[0] || "uncategorized";
              const CategoryIcon = getIconForTech(category);
              return (
                <div
                  key={id}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-primary/5 transition-colors group"
                >
                  <button
                    className="mt-1 flex-shrink-0 h-5 w-5 rounded-full border border-primary/30 hover:border-primary/50 transition-colors group-hover:bg-primary/10"
                    onClick={() => toggleTodoCompletion(id)}
                    aria-label="Mark as read"
                  />
                  <div className="min-w-0 flex-1">
                    <button
                      className="text-left text-sm font-medium hover:text-primary transition-colors line-clamp-1 w-full"
                      onClick={() => handleSelectDocument(path, title)}
                    >
                      <span className="flex items-center gap-2">
                        <CategoryIcon className="h-3 w-3" />
                        {title}
                      </span>
                    </button>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Added {formatDate(addedAt)}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground bg-card/50 rounded-lg">
          <ListTodo className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Your reading list is empty</p>
          <p className="text-xs mt-1">Add documents you want to read later</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
            onClick={setShowAddTodoModal}
          >
            Add documents
          </Button>
        </div>
      )}

      {todoList.filter((item) => !item.completed).length > 3 && (
        <div className="text-center mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary hover:bg-primary/10"
            onClick={() => setActiveTab("todo")}
          >
            View all ({todoList.filter((item) => !item.completed).length})
          </Button>
        </div>
      )}
    </CardContainer>
  );
};

export default UpcomingReads;
