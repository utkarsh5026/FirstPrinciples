import { BookMarked, CheckCircle, Clock, CircleDot } from "lucide-react";

const Legend = () => {
  return (
    <div className="px-4 py-2 border-t border-border bg-secondary/5 text-xs">
      <div className="font-medium mb-1 text-foreground">Legend:</div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="flex items-center">
          <Clock size={12} className="text-blue-400 mr-1.5" />
          <span>Previously read</span>
        </div>
        <div className="flex items-center">
          <BookMarked size={12} className="text-primary mr-1.5" />
          <span>In reading list</span>
        </div>
        <div className="flex items-center">
          <CheckCircle size={12} className="text-green-500 mr-1.5" />
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <CircleDot size={12} className="text-muted-foreground/40 mr-1.5" />
          <span>Unread</span>
        </div>
      </div>
      <div className="pt-1 border-t border-border/50">
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 border-l-2 border-primary/30 mr-1.5"></div>
          <span>In reading list</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 border-l-2 border-green-500/30 mr-1.5"></div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default Legend;
