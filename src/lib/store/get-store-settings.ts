import { eq } from "drizzle-orm";

import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import {
  defaultGeneralSettings,
  generalSettingsSchema,
  parseGeneralSettingsValue,
  type GeneralSettingsValue,
} from "@/lib/store/general-config";
import {
  defaultIntegrationsSettings,
  integrationsSettingsSchema,
  parseIntegrationsSettingsValue,
  type IntegrationsSettingsValue,
} from "@/lib/store/integrations-config";
import {
  defaultSocialSettings,
  parseSocialSettingsValue,
  socialSettingsSchema,
  type SocialSettingsValue,
} from "@/lib/store/social-config";
import {
  defaultTypographySettings,
  parseTypographySettingsValue,
  typographySettingsSchema,
  type TypographySettingsValue,
} from "@/lib/store/typography-config";
import {
  defaultShippingSettings,
  parseShippingSettingsValue,
  shippingSettingsSchema,
  type ShippingSettingsValue,
} from "@/lib/store/shipping-config";
import {
  HOME_SETTINGS_KEY,
  STORE_GENERAL_KEY,
  STORE_INTEGRATIONS_KEY,
  STORE_SHIPPING_KEY,
  STORE_SOCIAL_KEY,
  STORE_TYPOGRAPHY_KEY,
} from "@/lib/store/store-settings-keys";

async function readSetting(key: string) {
  const [row] = await db
    .select({ value: storeSettings.value })
    .from(storeSettings)
    .where(eq(storeSettings.key, key))
    .limit(1);

  return row?.value ?? null;
}

async function writeSetting(key: string, value: unknown) {
  await db
    .insert(storeSettings)
    .values({
      key,
      value: value as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: storeSettings.key,
      set: {
        value: value as Record<string, unknown>,
        updatedAt: new Date(),
      },
    });
}

export async function getGeneralSettings(): Promise<GeneralSettingsValue> {
  const value = await readSetting(STORE_GENERAL_KEY);
  return value ? parseGeneralSettingsValue(value) : defaultGeneralSettings;
}

export async function saveGeneralSettings(value: GeneralSettingsValue) {
  const parsed = generalSettingsSchema.parse(value);
  await writeSetting(STORE_GENERAL_KEY, parsed);
}

export async function getShippingSettings(): Promise<ShippingSettingsValue> {
  const value = await readSetting(STORE_SHIPPING_KEY);
  return value ? parseShippingSettingsValue(value) : defaultShippingSettings;
}

export async function saveShippingSettings(value: ShippingSettingsValue) {
  const parsed = shippingSettingsSchema.parse(value);
  await writeSetting(STORE_SHIPPING_KEY, parsed);
}

export async function getIntegrationsSettings(): Promise<IntegrationsSettingsValue> {
  const value = await readSetting(STORE_INTEGRATIONS_KEY);
  return value
    ? parseIntegrationsSettingsValue(value)
    : defaultIntegrationsSettings;
}

export async function saveIntegrationsSettings(
  value: IntegrationsSettingsValue,
) {
  const parsed = integrationsSettingsSchema.parse(value);
  await writeSetting(STORE_INTEGRATIONS_KEY, parsed);
}

export async function getSocialSettings(): Promise<SocialSettingsValue> {
  const value = await readSetting(STORE_SOCIAL_KEY);
  if (value) return parseSocialSettingsValue(value);

  const general = await getGeneralSettings();
  if (general.instagram?.trim()) {
    return {
      ...defaultSocialSettings,
      instagram: general.instagram,
    };
  }

  return defaultSocialSettings;
}

export async function saveSocialSettings(value: SocialSettingsValue) {
  const parsed = socialSettingsSchema.parse(value);
  await writeSetting(STORE_SOCIAL_KEY, parsed);
}

export async function getTypographySettings(): Promise<TypographySettingsValue> {
  const value = await readSetting(STORE_TYPOGRAPHY_KEY);
  return value ? parseTypographySettingsValue(value) : defaultTypographySettings;
}

export async function saveTypographySettings(value: TypographySettingsValue) {
  const parsed = typographySettingsSchema.parse(value);
  await writeSetting(STORE_TYPOGRAPHY_KEY, parsed);
}

export type StoreRuntimeConfig = {
  general: GeneralSettingsValue;
  shipping: ShippingSettingsValue;
  integrations: IntegrationsSettingsValue;
  social: SocialSettingsValue;
};

export async function getStoreRuntimeConfig(): Promise<StoreRuntimeConfig> {
  const [general, shipping, integrations, social] = await Promise.all([
    getGeneralSettings(),
    getShippingSettings(),
    getIntegrationsSettings(),
    getSocialSettings(),
  ]);

  return { general, shipping, integrations, social };
}

export { HOME_SETTINGS_KEY };
