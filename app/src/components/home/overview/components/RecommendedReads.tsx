import React from "react";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileMetadata } from "@/utils/MarkdownLoader";
import getIconForTech from "@/components/icons";
import { fromSnakeToTitleCase } from "@/utils/string";

interface RecommendedReadsProps {
  featuredDocs: FileMetadata[];
  mostReadCategory: string;
  handleSelectDocument: (path: string, title: string) => void;
}

/**
 * RecommendedReads component displays a list of recommended reading materials
 * tailored to the user's interests. 📚✨
 *
 * This component takes in a selection of documents that are featured based on
 * the user's reading habits and preferences. It aims to enhance the user's
 * reading experience by providing personalized suggestions, making it easier
 * for them to discover new content that aligns with their interests. 🌟
 *
 * The component also highlights the most read category, giving users insight
 * into what topics are trending in their reading journey. If there are no
 * recommendations available, it gently encourages users to read more to
 * receive personalized suggestions. 😊
 */
const RecommendedReads: React.FC<RecommendedReadsProps> = ({
  featuredDocs,
  mostReadCategory,
  handleSelectDocument,
}) => {
  return (
    <Card className="p-4 border-primary/10 hover:border-primary/30 transition-colors overflow-hidden relative rounded-3xl">
      {/* Decorative background element */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-radial from-primary/5 to-transparent rounded-full -mr-8 -mt-8 opacity-50"></div>

      <div className="relative">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium flex items-center">
            <Star className="h-4 w-4 mr-2 text-primary/70" />
            Recommended for You
          </h4>
          {mostReadCategory !== "None yet" && (
            <Badge
              variant="secondary"
              className="text-xs bg-primary/10 border-none text-primary"
            >
              Based on {mostReadCategory}
            </Badge>
          )}
        </div>

        {featuredDocs.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {featuredDocs.map(({ path, title }) => {
              const category = path.split("/")[0];
              const CategoryIcon = getIconForTech(category);
              return (
                <button
                  key={path}
                  className="p-3 rounded-2xl border border-border/40 hover:border-primary/20 hover:bg-primary/5 transition-all text-left flex flex-col"
                  onClick={() => handleSelectDocument(path, title)}
                >
                  <span className="text-sm font-medium line-clamp-2">
                    {title}
                  </span>
                  <div className="mt-auto pt-2 flex items-center text-xs text-muted-foreground">
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    <span className="truncate">
                      {fromSnakeToTitleCase(category)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground bg-card/50 rounded-lg">
            <Star className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No recommendations yet</p>
            <p className="text-xs mt-1">
              Read more to get personalized suggestions
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecommendedReads;
