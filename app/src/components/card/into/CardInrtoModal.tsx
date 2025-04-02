import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  ChevronsLeftRight,
  ArrowLeftRight,
  BookOpen,
  IdCard,
} from "lucide-react";

interface CardIntroModalProps {
  className?: string;
}

/**
 * CardIntroModal Component
 *
 * A modal that introduces users to the card view functionality.
 * This modal appears automatically the first time a user accesses the card view,
 * and explains the key features and navigation methods.
 *
 * @param {object} props - Component props
 * @param {string} [props.className] - Optional CSS class name for styling
 */
const CardIntroModal: React.FC<CardIntroModalProps> = ({ className }) => {
  /**
   * State to control the visibility of the modal
   */
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Effect hook that checks if the user has seen the intro before
   * and displays the modal if they haven't.
   *
   * Uses localStorage to persist the user's preference across sessions.
   */
  useEffect(() => {
    // Check if this is the first time the user is using card view
    const hasSeenCardIntro = localStorage.getItem("hasSeenCardIntro");

    if (!hasSeenCardIntro) {
      // Show the intro modal after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, []);

  /**
   * Handles closing the modal and saves the user's preference
   * to localStorage to prevent showing the intro again.
   */
  const handleClose = () => {
    setIsOpen(false);
    // Mark that the user has seen the intro
    localStorage.setItem("hasSeenCardIntro", "true");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        className={cn(
          "sm:max-w-md border-primary/20 font-type-mono",
          className
        )}
        side="bottom"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <IdCard className="h-5 w-5 text-primary" />
            <span>Card View</span>
          </SheetTitle>
          <SheetDescription>
            Learn how to use the new card view for easier reading
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-2">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <ChevronsLeftRight className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Swipe to Navigate</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Swipe left or right to move between section cards. Each card
                represents a section of the document.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <ArrowLeftRight className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                Section Navigation
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use the navigation controls or tap the indicators at the bottom
                to jump to specific sections.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Focused Learning</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Card view helps you focus on one section at a time, making it
                easier to learn complex concepts step by step.
              </p>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button onClick={handleClose} className="w-full">
            Got it
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CardIntroModal;
