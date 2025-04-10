import { Search } from "lucide-react";

const EmptyFilteredResult = () => {
  return (
    <div className="text-center py-6 md:py-12 border border-primary/10 rounded-lg bg-primary/5">
      <Search className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 text-primary/30" />
      <h3 className="text-base md:text-lg font-medium">
        No matching results 😭😭
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        Try adjusting your search or filters 😊
      </p>
    </div>
  );
};

export default EmptyFilteredResult;
