export const STORE_NAV_LINKS = [
  { label: "Novidades", href: "/produtos?sort=novidades" },
  { label: "Vestidos", href: "/produtos?categoria=vestidos" },
  { label: "Conjuntos", href: "/produtos?categoria=conjuntos" },
  { label: "Acessórios", href: "/produtos?categoria=acessorios" },
] as const;

export const HERO_CONTENT = {
  eyebrow: "Lookbook 02 / 26",
  title: "Outono Inverno",
  titleAccent: "em alta",
  description:
    "Alfaiataria fluida, toques de seda e a paleta nude que define a temporada. Peças pensadas para a mulher que veste elegância sem esforço.",
  ctaLabel: "Ver lookbook",
  ctaHref: "/produtos?sort=lookbook",
} as const;
