export const STORE_GENERAL_KEY = "store_general";
export const STORE_SHIPPING_KEY = "store_shipping";
export const STORE_INTEGRATIONS_KEY = "store_integrations";
export const STORE_SOCIAL_KEY = "store_social";
export const STORE_TYPOGRAPHY_KEY = "store_typography";
export const HOME_SETTINGS_KEY = "home_page";

export const STORE_SETTINGS_KEYS = [
  HOME_SETTINGS_KEY,
  STORE_GENERAL_KEY,
  STORE_SHIPPING_KEY,
  STORE_INTEGRATIONS_KEY,
  STORE_SOCIAL_KEY,
  STORE_TYPOGRAPHY_KEY,
] as const;

export type StoreSettingsKey = (typeof STORE_SETTINGS_KEYS)[number];
