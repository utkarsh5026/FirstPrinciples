import { BookMarked, CheckCircle, Clock, CircleDot } from "lucide-react";

const Legend = () => {
  return (
    <div className="px-4 py-3 border-t border-border bg-secondary/5 text-xs">
      <div className="font-medium mb-2 text-foreground">Legend:</div>

      {/* Icon and color-based legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
        {/* Status icons */}
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-5 flex justify-center">
              <CircleDot size={12} className="text-muted-foreground/40" />
            </div>
            <span className="ml-2">Unread</span>
          </div>

          <div className="flex items-center">
            <div className="w-5 flex justify-center">
              <Clock size={12} className="text-green-400" />{" "}
              {/* Changed to green */}
            </div>
            <span className="ml-2 text-green-400">Previously read</span>{" "}
            {/* Added text color */}
          </div>

          <div className="flex items-center">
            <div className="w-5 flex justify-center">
              <BookMarked size={12} className="text-primary" />
            </div>
            <span className="ml-2 text-primary">In reading list</span>{" "}
            {/* Added text color */}
          </div>

          <div className="flex items-center">
            <div className="w-5 flex justify-center">
              <CheckCircle size={12} className="text-green-500" />
            </div>
            <span className="ml-2 text-green-500">Completed</span>{" "}
            {/* Added text color */}
          </div>
        </div>

        {/* Color bars */}
        <div className="space-y-2">
          <div className="font-medium mb-1 text-foreground mt-2 sm:mt-0">
            Color indicators:
          </div>

          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-sm bg-green-400/70"></div>{" "}
              {/* Changed to green */}
            </div>
            <span className="text-green-400">Previously read</span>{" "}
            {/* Added text color */}
          </div>

          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-sm bg-primary/70"></div>
            </div>
            <span className="text-primary">In reading list</span>{" "}
            {/* Added text color */}
          </div>

          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-sm bg-green-500/70"></div>
            </div>
            <span className="text-green-500">Completed</span>{" "}
            {/* Added text color */}
          </div>
        </div>
      </div>

      {/* Mobile swipe hint */}
      <div className="mt-3 pt-2 border-t border-border/50 text-muted-foreground italic text-center sm:text-left">
        <span className="sm:hidden">Swipe right to close sidebar</span>
        <span className="hidden sm:inline">Press ESC or click X to close</span>
      </div>
    </div>
  );
};

export default Legend;
