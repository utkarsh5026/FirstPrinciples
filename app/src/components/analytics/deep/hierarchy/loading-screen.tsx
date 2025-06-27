import { FolderTree } from "lucide-react";
import { Card } from "@/components/ui/card";

const Loading = () => {
  return (
    <Card className="p-4 border-primary/10">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium flex items-center">
          <FolderTree className="h-4 w-4 mr-2 text-primary" />
          Category Deep Insights
        </h4>
      </div>
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-r-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading category insights...</p>
        </div>
      </div>
    </Card>
  );
};

export default Loading;
