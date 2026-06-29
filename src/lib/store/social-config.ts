import { z } from "zod";

export const socialSettingsSchema = z.object({
  instagram: z.string().min(1, "Informe o link do Instagram"),
  tiktok: z.string().min(1, "Informe o link do TikTok"),
  shopee: z.string().min(1, "Informe o link da Shopee"),
});

export type SocialSettingsValue = z.infer<typeof socialSettingsSchema>;

export const defaultSocialSettings: SocialSettingsValue = {
  instagram: "https://www.instagram.com/store.luperini/",
  tiktok: "#",
  shopee: "#",
};

export function parseSocialSettingsValue(value: unknown): SocialSettingsValue {
  const parsed = socialSettingsSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  return defaultSocialSettings;
}

export function normalizeSocialUrl(raw: string, platform: "instagram" | "tiktok" | "shopee") {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "#") return "#";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("@")) {
    const handle = trimmed.slice(1);
    if (platform === "instagram") {
      return `https://www.instagram.com/${handle}/`;
    }
    if (platform === "tiktok") {
      return `https://www.tiktok.com/@${handle}`;
    }
  }

  if (platform === "instagram" && !trimmed.includes("instagram.com")) {
    return `https://www.instagram.com/${trimmed.replace(/^@/, "")}/`;
  }

  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

export function isSocialLinkPlaceholder(url: string) {
  return url.trim() === "" || url.trim() === "#";
}

export function hasLinkedSocialSettings(settings: SocialSettingsValue) {
  return (["instagram", "tiktok", "shopee"] as const).some((key) => {
    const href = normalizeSocialUrl(settings[key], key);
    return !isSocialLinkPlaceholder(href);
  });
}
