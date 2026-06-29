import Link from "next/link";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface StoreBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function StoreBreadcrumbs({ items, className }: StoreBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "font-store-sans text-[11px] uppercase tracking-[0.16em] text-store-charcoal/45",
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="transition-opacity hover:opacity-70">
            Início
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            {item.href ? (
              <Link href={item.href} className="transition-opacity hover:opacity-70">
                {item.label}
              </Link>
            ) : (
              <span className="text-store-charcoal">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
