import { cn } from "@/lib/utils";

interface StripePlaceholderProps {
  className?: string;
  children?: React.ReactNode;
}

export function StripePlaceholder({
  className,
  children,
}: StripePlaceholderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-store-beige bg-store-stripe",
        className,
      )}
    >
      {children}
    </div>
  );
}
