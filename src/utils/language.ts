import { BadRequestResponse } from './errors';

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

export type HashmapChangeRequest<T = string> = { key: Locale; value: T }[];

export function localeFromString(input: string): Locale | undefined {
  return Locale[input as keyof typeof Locale];
}

export async function processHashmapChangeRequest(
  request: HashmapChangeRequest,
  onRemove: (loc: Locale) => Promise<unknown>,
  onChange: (value: string, loc: Locale) => Promise<unknown>
) {
  const promises: Promise<unknown>[] = [];

  Object.values(request).forEach(entry => {
    const loc = localeFromString(entry.key);
    if (!loc) {
      throw new BadRequestResponse(`Request contains an invalid locale: ${entry.key}`);
    }
    if (entry.value == null) {
      throw new BadRequestResponse(
        `Invalid value for locale: ${loc}, use an empty string to delete instead of null or undefined`
      );
    }

    if (entry.value === '') {
      promises.push(onRemove(loc));
    } else {
      promises.push(onChange(entry.value, loc));
    }
  });

  await Promise.all(promises);
}
