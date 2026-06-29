import { z } from "zod";

export { HOME_SETTINGS_KEY } from "@/lib/store/store-settings-keys";
export const MAX_HOME_NAV_ITEMS = 6;

export const defaultHomeHero = {
  eyebrow: "Lookbook 02 / 26",
  title: "Outono Inverno",
  titleAccent: "em alta",
  description:
    "Alfaiataria fluida, toques de seda e a paleta nude que define a temporada. Peças pensadas para a mulher que veste elegância sem esforço.",
  ctaLabel: "Ver lookbook",
  ctaHref: "/produtos?sort=lookbook",
  imageUrl: "/images-main/home-left-hero.png",
} as const;

export const defaultHomeNavLinks = [
  { label: "Novidades", href: "/produtos?sort=novidades" },
  { label: "Vestidos", href: "/produtos?categoria=vestidos" },
  { label: "Conjuntos", href: "/produtos?categoria=conjuntos" },
  { label: "Acessórios", href: "/produtos?categoria=acessorios" },
] as const;

const heroSchema = z.object({
  eyebrow: z.string().min(1, "Informe o rótulo superior"),
  title: z.string().min(1, "Informe o título"),
  titleAccent: z.string().min(1, "Informe o destaque do título"),
  description: z.string().min(1, "Informe a descrição"),
  ctaLabel: z.string().min(1, "Informe o texto do botão"),
  ctaHref: z.string().min(1, "Informe o link do botão"),
  imageUrl: z.string().min(1, "Informe a imagem do hero"),
});

export const homePageSettingsSchema = z.object({
  navCategoryIds: z
    .array(z.string().uuid())
    .max(MAX_HOME_NAV_ITEMS, `Máximo de ${MAX_HOME_NAV_ITEMS} categorias no menu`),
  hero: heroSchema,
});

export type HomePageSettingsValue = z.infer<typeof homePageSettingsSchema>;

export type StoreNavLink = {
  label: string;
  href: string;
};

export type HomePageConfig = {
  navLinks: StoreNavLink[];
  hero: HomePageSettingsValue["hero"];
};

export const defaultHomePageSettings: HomePageSettingsValue = {
  navCategoryIds: [],
  hero: { ...defaultHomeHero },
};

export function parseHomePageSettingsValue(
  value: unknown,
): HomePageSettingsValue {
  const parsed = homePageSettingsSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  return defaultHomePageSettings;
}
