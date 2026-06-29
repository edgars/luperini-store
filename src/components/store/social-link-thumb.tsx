import { InstagramIcon } from "@/components/icons/instagram-icon";
import { TikTokIcon } from "@/components/icons/tiktok-icon";
import type { SocialPlatform } from "@/lib/social-video-links";
import { cn } from "@/lib/utils";

export function socialThumbClass(platform: SocialPlatform) {
  return platform === "tiktok"
    ? "bg-[#010101] text-[#25F4EE]"
    : "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white";
}

export function SocialLinkIcon({
  platform,
  className,
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  if (platform === "tiktok") {
    return <TikTokIcon className={className} />;
  }

  return <InstagramIcon className={className} />;
}

export function SocialLinkThumb({
  platform,
  label,
  className,
}: {
  platform: SocialPlatform;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center px-1",
        socialThumbClass(platform),
        className,
      )}
    >
      <SocialLinkIcon platform={platform} className="h-4 w-4" />
      <span className="mt-1 text-center font-store-sans text-[9px] uppercase tracking-[0.12em]">
        {label}
      </span>
    </div>
  );
}
