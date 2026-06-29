export type InstagramMediaType = "post" | "reel";

export type ParsedInstagramUrl = {
  url: string;
  shortcode: string;
  mediaType: InstagramMediaType;
  embedUrl: string;
};

export {
  getInstagramMediaLabel,
  getSocialOpenLabel,
  getSocialPlatformLabel,
  parseSocialVideoUrl,
  validateSocialVideoUrl,
  type ParsedSocialVideoLink,
  type SocialPlatform,
} from "@/lib/social-video-links";

import {
  parseSocialVideoUrl,
  validateSocialVideoUrl,
} from "@/lib/social-video-links";

const INSTAGRAM_PATH_PATTERN =
  /(?:https?:\/\/)?(?:www\.)?instagram\.com(?:\/[^/?#]+)?\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i;

export function parseInstagramUrl(raw: string): ParsedInstagramUrl | null {
  const parsed = parseSocialVideoUrl(raw);
  if (!parsed || parsed.platform !== "instagram") return null;

  const match = raw.trim().match(INSTAGRAM_PATH_PATTERN);
  if (!match) return null;

  const pathType = match[1].toLowerCase();
  const shortcode = match[2];
  const mediaType: InstagramMediaType =
    pathType === "reel" || pathType === "reels" ? "reel" : "post";

  return {
    url: parsed.url,
    shortcode,
    mediaType,
    embedUrl: parsed.embedUrl ?? "",
  };
}

export function validateInstagramUrl(raw: string): string | null {
  if (!raw.trim()) return "Informe o link do Instagram.";
  if (!parseInstagramUrl(raw)) {
    return validateSocialVideoUrl(raw) ?? "Link inválido.";
  }
  return null;
}
