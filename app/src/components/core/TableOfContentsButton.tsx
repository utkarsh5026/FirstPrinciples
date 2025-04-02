import React from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TableOfContentsButtonProps {
  onClick: () => void;
  itemCount: number;
  className?: string;
}

const TableOfContentsButton: React.FC<TableOfContentsButtonProps> = ({
  onClick,
  itemCount,
  className,
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      title="Open Table of Contents"
      className={cn(
        "fixed z-10 sm:z-auto sm:relative sm:shadow-none",
        "bottom-4 right-4 shadow-md",
        "flex items-center gap-2 bg-card/80 backdrop-blur-sm",
        "h-10 w-10 sm:w-auto sm:px-3 rounded-full sm:rounded-md",
        className
      )}
    >
      <List size={18} />
      <span className="hidden sm:inline-block">Contents</span>
      {itemCount > 0 && (
        <Badge
          variant="secondary"
          className="hidden sm:flex absolute -top-2 -right-2 sm:static sm:ml-1 h-5 w-5 p-0 text-xs justify-center items-center"
        >
          {itemCount}
        </Badge>
      )}
    </Button>
  );
};

export default TableOfContentsButton;
