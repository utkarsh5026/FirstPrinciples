import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyListProps {
  handleAddDocumentsModal: () => void;
}

/**
 * 🌟 EmptyList Component
 *
 * This delightful component serves as a friendly reminder for users when their reading list is empty.
 * It creates a warm and inviting space that encourages users to add documents to their reading list,
 * helping them keep track of their learning journey. 📚✨
 *
 * The component features a charming illustration and a motivational message,
 * making it clear that users can easily start adding documents to their list.
 * The button provided allows users to open a modal for adding new documents,
 * ensuring a smooth and engaging experience. 😊
 */
const EmptyList: React.FC<EmptyListProps> = ({ handleAddDocumentsModal }) => {
  return (
    <div className="py-10 flex flex-col items-center justify-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
        <BookOpen className="h-12 w-12 text-primary/70 relative z-10" />
      </div>
      <h3 className="text-base font-medium mb-2">Your reading list is empty</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">
        Add documents you want to read later to keep track of your learning
        journey
      </p>
      <Button
        onClick={() => handleAddDocumentsModal()}
        className="bg-primary/90 hover:bg-primary rounded-full"
      >
        <Plus className="mr-1.5 h-4 w-4" /> Add documents
      </Button>
    </div>
  );
};

export default EmptyList;
