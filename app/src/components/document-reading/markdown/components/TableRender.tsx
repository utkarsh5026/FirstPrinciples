import React from "react";

type TableElementProps = React.ComponentPropsWithoutRef<
  "table" | "thead" | "tbody" | "tr" | "th" | "td"
>;

interface TableRenderProps {
  type: "table" | "thead" | "tbody" | "tr" | "th" | "td";
  props: TableElementProps;
}

/**
 * TableRender Component
 *
 * Renders table elements with consistent styling for table, thead, tbody, tr, th, and td.
 */
const TableRender: React.FC<TableRenderProps> = ({ type, props }) => {
  switch (type) {
    case "table":
      return (
        <div className="my-6 overflow-x-auto">
          <table
            {...(props as React.ComponentPropsWithoutRef<"table">)}
            className="min-w-full divide-y divide-[#303030] border border-[#303030] rounded-md"
          />
        </div>
      );
    case "thead":
      return (
        <thead
          {...(props as React.ComponentPropsWithoutRef<"thead">)}
          className="bg-[#252525]"
        />
      );
    case "tbody":
      return (
        <tbody
          {...(props as React.ComponentPropsWithoutRef<"tbody">)}
          className="divide-y divide-[#303030]"
        />
      );
    case "tr":
      return (
        <tr
          {...(props as React.ComponentPropsWithoutRef<"tr">)}
          className="hover:bg-[#242424]"
        />
      );
    case "th":
      return (
        <th
          {...(props as React.ComponentPropsWithoutRef<"th">)}
          className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
        />
      );
    case "td":
      return (
        <td
          {...(props as React.ComponentPropsWithoutRef<"td">)}
          className="px-4 py-3 text-sm text-gray-300"
        />
      );
    default:
      return null;
  }
};

export default TableRender;
