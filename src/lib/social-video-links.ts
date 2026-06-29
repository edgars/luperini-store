export type SocialPlatform = "instagram" | "tiktok";

export type InstagramMediaType = "post" | "reel";

export type ParsedSocialVideoLink = {
  platform: SocialPlatform;
  url: string;
  embedUrl: string | null;
  label: string;
};

const INSTAGRAM_PATH_PATTERN =
  /(?:https?:\/\/)?(?:www\.)?instagram\.com(?:\/[^/?#]+)?\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i;

const TIKTOK_VIDEO_PATTERN =
  /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.]+\/video\/(\d+)/i;

const TIKTOK_SHORT_PATTERN =
  /(?:https?:\/\/)?(?:vm\.)?tiktok\.com\/(?:t\/)?([A-Za-z0-9]+)/i;

function parseInstagramLink(raw: string): ParsedSocialVideoLink | null {
  const input = raw.trim();
  const match = input.match(INSTAGRAM_PATH_PATTERN);
  if (!match) return null;

  const pathType = match[1].toLowerCase();
  const shortcode = match[2];
  const mediaType: InstagramMediaType =
    pathType === "reel" || pathType === "reels" ? "reel" : "post";
  const pathSegment = mediaType === "reel" ? "reel" : "p";
  const url = `https://www.instagram.com/${pathSegment}/${shortcode}/`;

  return {
    platform: "instagram",
    url,
    embedUrl: `https://www.instagram.com/${pathSegment}/${shortcode}/embed`,
    label: mediaType === "reel" ? "Reel" : "Post",
  };
}

function parseTikTokLink(raw: string): ParsedSocialVideoLink | null {
  const input = raw.trim();
  const videoMatch = input.match(TIKTOK_VIDEO_PATTERN);

  if (videoMatch) {
    const videoId = videoMatch[1];

    return {
      platform: "tiktok",
      url: normalizeTikTokUrl(input, videoId),
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      label: "Vídeo",
    };
  }

  const shortMatch = input.match(TIKTOK_SHORT_PATTERN);
  if (shortMatch) {
    const url = input.startsWith("http") ? input.split("?")[0] : `https://vm.tiktok.com/${shortMatch[1]}`;

    return {
      platform: "tiktok",
      url,
      embedUrl: null,
      label: "Vídeo",
    };
  }

  return null;
}

function normalizeTikTokUrl(raw: string, videoId: string) {
  const trimmed = raw.trim().split("?")[0];
  if (trimmed.startsWith("http")) return trimmed;
  return `https://www.tiktok.com/video/${videoId}`;
}

export function parseSocialVideoUrl(raw: string): ParsedSocialVideoLink | null {
  return parseInstagramLink(raw) ?? parseTikTokLink(raw);
}

export function validateSocialVideoUrl(raw: string): string | null {
  if (!raw.trim()) return "Informe o link do Instagram ou TikTok.";

  if (!parseSocialVideoUrl(raw)) {
    return "Link inválido. Use um post/reel do Instagram ou um vídeo do TikTok.";
  }

  return null;
}

export function getSocialPlatformLabel(platform: SocialPlatform) {
  return platform === "instagram" ? "Instagram" : "TikTok";
}

export function getSocialOpenLabel(link: ParsedSocialVideoLink) {
  return `Abrir no ${getSocialPlatformLabel(link.platform)}`;
}

// Backwards-compatible helpers
export { parseInstagramLink as parseInstagramUrl };

export function validateInstagramUrl(raw: string): string | null {
  return validateSocialVideoUrl(raw);
}

export function getInstagramMediaLabel(mediaType: InstagramMediaType) {
  return mediaType === "reel" ? "Reel" : "Post";
}
