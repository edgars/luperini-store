import { cn } from "@/lib/utils";

type ShopeeIconProps = {
  className?: string;
};

export function ShopeeIcon({ className }: ShopeeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("h-4 w-4", className)}
      fill="currentColor"
    >
      <path d="M12 2c-2.2 0-4 .9-5.2 2.4C5.6 2.9 3.8 2 1.6 2 .7 2 0 2.7 0 3.6v1.8c0 .9.7 1.6 1.6 1.6.8 0 1.5.3 2 .8L6 10.2V20c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-9.8l2.4-2.2c.5-.5 1.2-.8 2-.8.9 0 1.6-.7 1.6-1.6V3.6C24 2.7 23.3 2 22.4 2 20.2 2 18.4 2.9 17.2 4.4 16 2.9 14.2 2 12 2zm0 2.2c1 0 1.9.4 2.6 1.1-.1.1-.2.2-.3.3l-2.3 2.1-2.3-2.1c-.1-.1-.2-.2-.3-.3.7-.7 1.6-1.1 2.6-1.1zM8 20v-8.3l4 3.6 4-3.6V20H8z" />
    </svg>
  );
}
