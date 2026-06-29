import {
  buildTypographyCss,
  type TypographySettingsValue,
} from "@/lib/store/typography-config";

type StoreTypographyStylesProps = {
  settings: TypographySettingsValue;
  scope?: string;
};

export function StoreTypographyStyles({
  settings,
  scope = ".store-theme",
}: StoreTypographyStylesProps) {
  const css = buildTypographyCss(settings, scope);
  if (!css) return null;

  return (
    <style
      data-store-typography
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
