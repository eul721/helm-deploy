/**
 * All supported locales
 */
export enum Locale {
  ar = 'ar',
  cs = 'cs',
  da = 'da',
  de = 'de',
  en = 'en',
  'es-419' = 'es-419',
  es = 'es',
  fi = 'fi',
  'fr-CA' = 'fr-CA',
  fr = 'fr',
  hu = 'hu',
  it = 'it',
  ja = 'ja',
  ko = 'ko',
  nb = 'nb',
  nl = 'nl',
  pl = 'pl',
  'pt-BR' = 'pt-BR',
  pt = 'pt',
  ru = 'ru',
  sv = 'sv',
  th = 'th',
  tr = 'tr',
  vi = 'vi',
  'zh-CN' = 'zh-CN',
  'zh-Hant' = 'zh-Hant',
}

export type LocalizedHashmap<T = string> = Partial<Record<Locale, T>>;

export function localeFromString(input: string): Locale | undefined {
  return Locale[input as keyof typeof Locale];
}
