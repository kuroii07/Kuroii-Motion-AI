export const locales = ["zh-CN", "en-US", "ja-JP", "ko-KR"];
export const defaultLocale = "zh-CN";
export const fallbackLocale = "en-US";

export function resolveLocale(input) {
  return locales.includes(input) ? input : fallbackLocale;
}
