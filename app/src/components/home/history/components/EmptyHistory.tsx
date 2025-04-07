import React from "react";
import { History, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EmptyHistory: React.FC = () => {
  return (
    <Card className="p-8 border-dashed border-2 border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center">
      <History className="h-16 w-16 mb-4 text-primary/30" />
      <h3 className="text-lg font-medium mb-2">No Reading History</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Your reading history will appear here once you start reading documents.
        Track your progress and see patterns in your reading habits.
      </p>
      <Button className="bg-primary text-primary-foreground">
        <BookOpen className="mr-2 h-4 w-4" />
        Start Reading
      </Button>
    </Card>
  );
};

export default EmptyHistory;
