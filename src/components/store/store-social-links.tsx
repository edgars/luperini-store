import { InstagramIcon } from "@/components/icons/instagram-icon";
import { ShopeeIcon } from "@/components/icons/shopee-icon";
import { TikTokIcon } from "@/components/icons/tiktok-icon";
import {
  isSocialLinkPlaceholder,
  normalizeSocialUrl,
  type SocialSettingsValue,
} from "@/lib/store/social-config";
import { cn } from "@/lib/utils";

type StoreSocialLinksProps = {
  settings: SocialSettingsValue;
  className?: string;
  /** When true, only platforms with a real URL are rendered. */
  onlyLinked?: boolean;
  variant?: "default" | "header";
};

const platforms = [
  {
    key: "instagram" as const,
    label: "Instagram",
    Icon: InstagramIcon,
    iconClass: "text-[#E1306C]",
  },
  {
    key: "tiktok" as const,
    label: "TikTok",
    Icon: TikTokIcon,
    iconClass: "text-store-charcoal",
  },
  {
    key: "shopee" as const,
    label: "Shopee",
    Icon: ShopeeIcon,
    iconClass: "text-[#EE4D2D]",
  },
];

export function StoreSocialLinks({
  settings,
  className,
  onlyLinked = false,
  variant = "default",
}: StoreSocialLinksProps) {
  const isHeader = variant === "header";

  const visiblePlatforms = platforms.filter(({ key }) => {
    if (!onlyLinked) return true;
    const href = normalizeSocialUrl(settings[key], key);
    return !isSocialLinkPlaceholder(href);
  });

  if (visiblePlatforms.length === 0) return null;

  return (
    <nav
      aria-label="Redes sociais"
      className={cn(
        "flex items-center",
        isHeader ? "gap-3.5" : "justify-center gap-5",
        className,
      )}
    >
      {visiblePlatforms.map(({ key, label, Icon, iconClass }) => {
        const href = normalizeSocialUrl(settings[key], key);
        const isPlaceholder = isSocialLinkPlaceholder(href);

        const content = (
          <>
            <Icon
              className={cn(
                isHeader ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-5 w-5",
                isHeader ? "text-store-charcoal/45" : iconClass,
              )}
            />
            <span className="sr-only">{label}</span>
          </>
        );

        if (isPlaceholder) {
          return (
            <span
              key={key}
              aria-label={`${label} — em breve`}
              className={cn(
                "flex items-center justify-center",
                isHeader
                  ? "opacity-30"
                  : "h-10 w-10 rounded-full border border-store-charcoal/10 opacity-40",
              )}
            >
              {content}
            </span>
          );
        }

        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={cn(
              "flex items-center justify-center transition-opacity",
              isHeader
                ? "hover:opacity-70"
                : "h-10 w-10 rounded-full border border-store-charcoal/10 hover:opacity-70",
            )}
          >
            {content}
          </a>
        );
      })}
    </nav>
  );
}
