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
import getIconForTech from "@/components/shared/icons";
import getTopicIcon from "@/components/shared/icons/topicIcon";

interface BreadCrumbViewProps {
  onBreadCrubClick: (index: number) => void;
  breadcrumbs: { id: string; name: string }[];
}

const BreadcrumbView: React.FC<BreadCrumbViewProps> = ({
  onBreadCrubClick,
  breadcrumbs,
}) => {
  return (
    <Breadcrumb>
      <BreadcrumbList className="px-1 py-1 bg-secondary/10 rounded-lg border border-border/30">
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => onBreadCrubClick(-1)}
            className="flex items-center h-7 px-2 rounded-md hover:bg-secondary/30"
          >
            <Home
              size={20}
              className="text-primary bg-primary/20 rounded-full p-0.5"
            />
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map((crumb, index) => {
          // Use the app's existing icon system
          const CrumbIcon =
            index === 0
              ? getIconForTech(crumb.id)
              : () =>
                  getTopicIcon(
                    breadcrumbs
                      .slice(0, index + 1)
                      .map((c) => c.name)
                      .join(">")
                  );

          return (
            <React.Fragment key={crumb.id}>
              <BreadcrumbSeparator>
                <ChevronRight size={14} />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="flex items-center">
                    <div className="mr-1.5 text-primary text-xs">
                      <CrumbIcon size={14} />
                    </div>
                    <span className="font-medium text-xs">{crumb.name}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => onBreadCrubClick(index)}
                    className="flex items-center hover:text-primary"
                  >
                    <div className="mr-1.5">
                      <CrumbIcon size={14} />
                    </div>
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
