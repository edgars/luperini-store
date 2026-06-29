import { cn } from "@/lib/utils";

type TikTokIconProps = {
  className?: string;
};

export function TikTokIcon({ className }: TikTokIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("h-4 w-4", className)}
      fill="currentColor"
    >
      <path d="M16.5 3h-2.2c.2 1.4.9 2.6 2 3.5 1 .8 2.2 1.2 3.5 1.1v2.2c-1.2 0-2.3-.3-3.3-.9v6.8c0 3.2-2.6 5.8-5.8 5.8S4.9 18.9 4.9 15.7c0-3.1 2.5-5.7 5.6-5.8v2.3c-1.9.1-3.4 1.7-3.4 3.5 0 1.9 1.6 3.5 3.5 3.5s3.5-1.6 3.5-3.5V3z" />
    </svg>
  );
}
