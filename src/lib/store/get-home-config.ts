import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { categories, storeSettings } from "@/db/schema";
import {
  defaultHomeNavLinks,
  defaultHomePageSettings,
  HOME_SETTINGS_KEY,
  type HomePageConfig,
  type HomePageSettingsValue,
  parseHomePageSettingsValue,
} from "@/lib/store/home-config";

async function getHomePageSettingsValue(): Promise<HomePageSettingsValue> {
  const [row] = await db
    .select({ value: storeSettings.value })
    .from(storeSettings)
    .where(eq(storeSettings.key, HOME_SETTINGS_KEY))
    .limit(1);

  if (!row) return defaultHomePageSettings;
  return parseHomePageSettingsValue(row.value);
}

export async function getHomePageConfig(): Promise<HomePageConfig> {
  const settings = await getHomePageSettingsValue();

  if (settings.navCategoryIds.length === 0) {
    return {
      navLinks: [...defaultHomeNavLinks],
      hero: settings.hero,
    };
  }

  const categoryRows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .where(inArray(categories.id, settings.navCategoryIds));

  const categoryMap = new Map(categoryRows.map((row) => [row.id, row]));

  const navLinks = settings.navCategoryIds
    .map((categoryId) => categoryMap.get(categoryId))
    .filter((category): category is NonNullable<typeof category> =>
      Boolean(category),
    )
    .map((category) => ({
      label: category.name,
      href: `/produtos?categoria=${category.slug}`,
    }));

  return {
    navLinks:
      navLinks.length > 0 ? navLinks : [...defaultHomeNavLinks],
    hero: settings.hero,
  };
}

export async function getHomePageSettingsForAdmin(): Promise<HomePageSettingsValue> {
  return getHomePageSettingsValue();
}

export async function saveHomePageSettingsValue(
  value: HomePageSettingsValue,
): Promise<void> {
  await db
    .insert(storeSettings)
    .values({
      key: HOME_SETTINGS_KEY,
      value,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: storeSettings.key,
      set: {
        value,
        updatedAt: new Date(),
      },
    });
}
