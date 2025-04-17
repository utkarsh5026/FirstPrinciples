import { Search } from "lucide-react";

/**
 * 🥺 EmptyFilteredResult Component
 *
 * This adorable component is displayed when there are no matching results
 * for the user's search or filters. It gently informs users that their search
 * didn't yield any results, encouraging them to try again! 🌈✨
 *
 * The component features a cute search icon to visually represent the search
 * action, along with a friendly message that expresses empathy for the user's
 * situation. It also suggests adjusting the search or filters, making the
 * experience feel supportive and user-friendly. 😊
 *
 * Overall, this component aims to create a positive interaction, even when
 * the results are empty, reminding users that they can refine their search
 * for better outcomes! 🌟
 */
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
