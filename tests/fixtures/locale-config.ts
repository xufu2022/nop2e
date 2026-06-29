export interface LocaleConfig {
  locale: string;
  timezone: string;
  currency: string;
}

export const locales = {
  'en-US': {
    locale: 'en-US',
    timezone: 'America/New_York',
    currency: 'USD',
  } as LocaleConfig,
  'en-CA': {
    locale: 'en-CA',
    timezone: 'America/Toronto',
    currency: 'CAD',
  } as LocaleConfig,
} as const;

export type LocaleName = keyof typeof locales;

export function getLocale(name: LocaleName = 'en-US'): LocaleConfig {
  return locales[name];
}
