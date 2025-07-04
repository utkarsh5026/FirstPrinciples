import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Home } from "lucide-react";
import getTopicIcon from "@/components/shared/icons/topic-icon";
import { fromSnakeToTitleCase } from "@/utils/string";

interface BreadCrumbViewProps {
  onBreadCrubClick: (index: number) => void;
  breadcrumbs: { id: string; name: string; path: string }[];
}

const BreadcrumbView: React.FC<BreadCrumbViewProps> = ({
  onBreadCrubClick,
  breadcrumbs,
}) => {
  const crumbs = breadcrumbs.map((crumb) => ({
    ...crumb,
    name: fromSnakeToTitleCase(crumb.name),
  }));

  return (
    <Breadcrumb>
      <BreadcrumbList className="px-1 py-1 bg-secondary/10 rounded-lg border border-border/30">
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => onBreadCrubClick(-1)}
            className="flex items-center h-7 px-2 rounded-md hover:bg-secondary/30 cursor-pointer"
          >
            <Home
              size={20}
              className="text-primary bg-primary/20 rounded-full p-0.5"
            />
          </BreadcrumbLink>
        </BreadcrumbItem>

        {crumbs.map((crumb, index) => {
          const icon = getTopicIcon(crumb.path);

          return (
            <React.Fragment key={crumb.id}>
              <BreadcrumbSeparator>
                <ChevronRight size={14} />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="flex items-center cursor-pointer">
                    <div className="mr-1.5 text-primary text-xs">{icon}</div>
                    <span className="font-medium text-xs">{crumb.name}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => onBreadCrubClick(index)}
                    className="flex items-center hover:text-primary cursor-pointer"
                  >
                    <div className="mr-1.5">{icon}</div>
                    <span className="text-xs">{crumb.name}</span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbView;
