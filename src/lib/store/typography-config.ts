import { z } from "zod";

export const storeFontIds = [
  "current",
  "admin",
  "poppins",
  "geist",
  "inter",
  "google_sans",
  "stack_sans",
  "gelasio",
  "elms_sans",
  "hanken_grotesk",
  "fraunces",
] as const;

export type StoreFontId = (typeof storeFontIds)[number];

export const typographyElements = [
  "h1",
  "h2",
  "h3",
  "paragraph",
  "buttons",
] as const;

export type TypographyElement = (typeof typographyElements)[number];

export type TypographyApplyMode = "uniform" | "by_element";

export const storeFontIdSchema = z.enum(storeFontIds);

export const typographyElementsSchema = z.object({
  h1: storeFontIdSchema,
  h2: storeFontIdSchema,
  h3: storeFontIdSchema,
  paragraph: storeFontIdSchema,
  buttons: storeFontIdSchema,
});

export const typographyPresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Informe um nome para o esquema"),
  applyMode: z.enum(["uniform", "by_element"]),
  uniformFont: storeFontIdSchema,
  elements: typographyElementsSchema,
});

export const typographySettingsSchema = z.object({
  applyMode: z.enum(["uniform", "by_element"]),
  uniformFont: storeFontIdSchema,
  elements: typographyElementsSchema,
  presets: z.array(typographyPresetSchema).max(24),
});

export type TypographyElementsValue = z.infer<typeof typographyElementsSchema>;
export type TypographyPreset = z.infer<typeof typographyPresetSchema>;
export type TypographySettingsValue = z.infer<typeof typographySettingsSchema>;

export const defaultTypographyElements: TypographyElementsValue = {
  h1: "current",
  h2: "current",
  h3: "current",
  paragraph: "current",
  buttons: "current",
};

export const defaultTypographySettings: TypographySettingsValue = {
  applyMode: "by_element",
  uniformFont: "current",
  elements: defaultTypographyElements,
  presets: [],
};

export const storeFontOptions: {
  id: StoreFontId;
  label: string;
  description?: string;
}[] = [
  { id: "current", label: "Atual", description: "Cormorant (títulos) e Jost (texto)" },
  { id: "admin", label: "Tema do admin", description: "Bricolage Grotesque" },
  { id: "poppins", label: "Poppins" },
  { id: "geist", label: "Geist" },
  { id: "inter", label: "Inter" },
  {
    id: "google_sans",
    label: "Google Sans",
    description: "Google Sans Flex",
  },
  { id: "stack_sans", label: "Stack Sans", description: "Stack Sans Text" },
  { id: "gelasio", label: "Gelasio" },
  { id: "elms_sans", label: "Elma Sans", description: "Elms Sans" },
  {
    id: "hanken_grotesk",
    label: "Hanken Grotesk",
    description: "Sans geométrica, boa para textos",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    description: "Serif expressiva, boa para títulos",
  },
];

export const typographyElementLabels: Record<TypographyElement, string> = {
  h1: "H1 — títulos principais",
  h2: "H2 — subtítulos de seção",
  h3: "H3 — títulos menores",
  paragraph: "Parágrafo — textos e labels",
  buttons: "Botões — CTAs e links de ação",
};

export function parseTypographySettingsValue(
  value: unknown,
): TypographySettingsValue {
  const parsed = typographySettingsSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  return defaultTypographySettings;
}

export function getStoreFontLabel(fontId: StoreFontId) {
  return storeFontOptions.find((option) => option.id === fontId)?.label ?? fontId;
}

/** Resolves a font choice to a CSS font-family value for the store theme. */
export function resolveStoreFontFamily(
  fontId: StoreFontId,
  element?: TypographyElement,
): string {
  if (fontId === "current") {
    if (element && (element === "h1" || element === "h2" || element === "h3")) {
      return "var(--font-cormorant), ui-serif, Georgia, serif";
    }
    return "var(--font-jost), ui-sans-serif, system-ui, sans-serif";
  }

  const families: Record<Exclude<StoreFontId, "current">, string> = {
    admin: "var(--font-bricolage), ui-sans-serif, system-ui, sans-serif",
    poppins: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif",
    geist: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    inter: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    google_sans:
      '"Google Sans Flex", var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
    stack_sans:
      '"Stack Sans Text", ui-sans-serif, system-ui, sans-serif',
    gelasio: "var(--font-gelasio), ui-serif, Georgia, serif",
    elms_sans: '"Elms Sans", ui-sans-serif, system-ui, sans-serif',
    hanken_grotesk:
      "var(--font-hanken-grotesk), ui-sans-serif, system-ui, sans-serif",
    fraunces: "var(--font-fraunces), ui-serif, Georgia, serif",
  };

  return families[fontId];
}

export function typographySettingsNeedsOverride(
  settings: TypographySettingsValue,
): boolean {
  if (settings.applyMode === "uniform") {
    return settings.uniformFont !== "current";
  }

  return typographyElements.some(
    (element) => settings.elements[element] !== "current",
  );
}

export function buildTypographyCss(
  settings: TypographySettingsValue,
  scope = ".store-theme",
): string {
  if (!typographySettingsNeedsOverride(settings)) {
    return "";
  }

  const rules: string[] = [];

  if (settings.applyMode === "uniform") {
    const family = resolveStoreFontFamily(settings.uniformFont);
    rules.push(
      `${scope} { font-family: ${family}; }`,
      `${scope} { --font-store-serif: ${family}; --font-store-sans: ${family}; }`,
      `${scope} :where(h1, h2, h3, p, button, a, span, label, input, textarea, select) { font-family: ${family}; }`,
      `${scope} :where(.font-store-serif, .font-store-sans) { font-family: ${family}; }`,
    );
    return rules.join("\n");
  }

  const elementSelectors: Record<TypographyElement, string> = {
    h1: `${scope} h1, ${scope} h1.font-store-serif`,
    h2: `${scope} h2, ${scope} h2.font-store-serif`,
    h3: `${scope} h3, ${scope} h3.font-store-serif`,
    paragraph: `${scope} p, ${scope} p.font-store-sans`,
    buttons: `${scope} button, ${scope} button.font-store-sans, ${scope} a.font-store-sans.bg-store-charcoal, ${scope} a.font-store-sans.border, ${scope} span.font-store-sans.bg-store-charcoal, ${scope} span.font-store-sans.border`,
  };

  for (const element of typographyElements) {
    const fontId = settings.elements[element];
    if (fontId === "current") continue;
    const family = resolveStoreFontFamily(fontId, element);
    rules.push(`${elementSelectors[element]} { font-family: ${family}; }`);
  }

  const headingFont = resolveStoreFontFamily(settings.elements.h1, "h1");
  const bodyFont = resolveStoreFontFamily(settings.elements.paragraph, "paragraph");

  if (settings.elements.h1 !== "current") {
    rules.push(`${scope} { --font-store-serif: ${headingFont}; }`);
  }
  if (settings.elements.paragraph !== "current") {
    rules.push(`${scope} { --font-store-sans: ${bodyFont}; }`);
  }

  return rules.join("\n");
}

export const TYPOGRAPHY_PREVIEW_SCOPE = ".typography-preview.store-theme";

/** Always emits rules for the admin preview (including "current" defaults). */
export function buildTypographyPreviewCss(
  settings: TypographySettingsValue,
): string {
  const scope = TYPOGRAPHY_PREVIEW_SCOPE;
  const rules: string[] = [];

  const headingSelector = `${scope} :is(h1.font-store-serif, h2.font-store-serif, h3.font-store-serif, h1, h2, h3)`;
  const paragraphSelector = `${scope} :is(p.font-store-sans, p, span.font-store-sans:not(.bg-store-charcoal):not(.border))`;
  const buttonSelector = `${scope} :is(button.font-store-sans, span.font-store-sans.bg-store-charcoal, span.font-store-sans.border, a.font-store-sans.bg-store-charcoal, a.font-store-sans.border)`;

  if (settings.applyMode === "uniform") {
    if (settings.uniformFont === "current") {
      const headingFamily = resolveStoreFontFamily("current", "h1");
      const bodyFamily = resolveStoreFontFamily("current", "paragraph");
      rules.push(
        `${headingSelector} { font-family: ${headingFamily} !important; }`,
        `${paragraphSelector} { font-family: ${bodyFamily} !important; }`,
        `${buttonSelector} { font-family: ${bodyFamily} !important; }`,
        `${scope} { --font-store-serif: ${headingFamily}; --font-store-sans: ${bodyFamily}; }`,
      );
      return rules.join("\n");
    }

    const family = resolveStoreFontFamily(settings.uniformFont);
    rules.push(
      `${scope} { font-family: ${family}; --font-store-serif: ${family}; --font-store-sans: ${family}; }`,
      `${scope} :is(h1, h2, h3, p, span, a, button, label, .font-store-serif, .font-store-sans) { font-family: ${family} !important; }`,
    );
    return rules.join("\n");
  }

  const elementSelectors: Record<TypographyElement, string> = {
    h1: `${scope} h1, ${scope} h1.font-store-serif`,
    h2: `${scope} h2, ${scope} h2.font-store-serif`,
    h3: `${scope} h3, ${scope} h3.font-store-serif`,
    paragraph: paragraphSelector,
    buttons: buttonSelector,
  };

  for (const element of typographyElements) {
    const family = resolveStoreFontFamily(settings.elements[element], element);
    rules.push(
      `${elementSelectors[element]} { font-family: ${family} !important; }`,
    );
  }

  const headingFamily = resolveStoreFontFamily(settings.elements.h1, "h1");
  const bodyFamily = resolveStoreFontFamily(
    settings.elements.paragraph,
    "paragraph",
  );
  rules.push(
    `${scope} { --font-store-serif: ${headingFamily}; --font-store-sans: ${bodyFamily}; }`,
  );

  return rules.join("\n");
}

export function typographyPreviewKey(settings: TypographySettingsValue) {
  if (settings.applyMode === "uniform") {
    return `uniform:${settings.uniformFont}`;
  }

  return typographyElements
    .map((element) => `${element}:${settings.elements[element]}`)
    .join("|");
}

export function createTypographyPreset(
  name: string,
  settings: Pick<
    TypographySettingsValue,
    "applyMode" | "uniformFont" | "elements"
  >,
): TypographyPreset {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    applyMode: settings.applyMode,
    uniformFont: settings.uniformFont,
    elements: { ...settings.elements },
  };
}
