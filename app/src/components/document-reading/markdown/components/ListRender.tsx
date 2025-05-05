import React from "react";

type ListProps =
  | { type: "ul"; props: React.ComponentPropsWithoutRef<"ul"> }
  | { type: "ol"; props: React.ComponentPropsWithoutRef<"ol"> }
  | { type: "li"; props: React.ComponentPropsWithoutRef<"li"> };

/**
 * ListRender Component
 *
 * Renders unordered lists, ordered lists, and list items with consistent styling.
 */
const ListRender: React.FC<ListProps> = ({ type, props }) => {
  if (type === "ul") {
    return <ul {...props} className="my-4 ml-6 list-disc space-y-2" />;
  } else if (type === "ol") {
    return <ol {...props} className="my-4 ml-6 list-decimal space-y-2" />;
  } else {
    return <li {...props} className="pl-1 leading-7 text-gray-300" />;
  }
};

export default ListRender;
