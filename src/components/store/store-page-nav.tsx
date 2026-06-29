import { StoreBackButton } from "@/components/store/store-back-button";
import {
  StoreBreadcrumbs,
  type BreadcrumbItem,
} from "@/components/store/store-breadcrumbs";
import { cn } from "@/lib/utils";

interface StorePageNavProps {
  breadcrumbs: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function StorePageNav({
  breadcrumbs,
  backHref,
  backLabel,
  className,
}: StorePageNavProps) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:mb-10", className)}>
      <StoreBackButton href={backHref} label={backLabel} />
      <StoreBreadcrumbs items={breadcrumbs} />
    </div>
  );
}
