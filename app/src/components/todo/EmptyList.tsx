import { Plus, ListTodo } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-card border border-border/40 rounded-2xl text-center">
      <div className="relative h-20 w-20 mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 rounded-full"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <ListTodo className="h-10 w-10 text-muted-foreground opacity-50" />
        </div>
      </div>

      <h3 className="text-lg font-medium">Your reading list is empty</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-md">
        Add documents you want to read later to keep track of your learning
        journey
      </p>

      <Button
        className="bg-primary/80 hover:bg-primary text-primary-foreground rounded-2xl"
        onClick={handleAddDocumentsModal}
      >
        <Plus className="h-4 w-4 mr-1.5" /> Add documents
      </Button>
    </div>
  );
};

export default EmptyList;
