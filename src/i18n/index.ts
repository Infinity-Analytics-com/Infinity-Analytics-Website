import { en, type Copy } from './en';
import { fr } from './fr';

// To add a language: create <code>.ts mirroring en.ts, register it here, done.
export const locales = { en, fr } as const satisfies Record<string, Copy>;
export type Lang = keyof typeof locales;
export const defaultLang: Lang = 'en';
export const langs = Object.keys(locales) as Lang[];
export const langNames: Record<Lang, string> = { en: 'EN', fr: 'FR' };
export const htmlLang: Record<Lang, string> = { en: 'en', fr: 'fr' };

/** `lang` route param is undefined for the default language (no URL prefix). */
export function resolveLang(param?: string): Lang {
  return (langs as string[]).includes(param ?? '') ? (param as Lang) : defaultLang;
}
export const getCopy = (lang: Lang): Copy => locales[lang];

/** Build a localised URL: href('/contact/', 'fr') -> '/fr/contact/' */
export function href(path: string, lang: Lang): string {
  const clean = '/' + path.replace(/^\/+|\/+$/g, '');
  const withSlash = clean === '/' ? '/' : clean + '/';
  return lang === defaultLang ? withSlash : `/${lang}${withSlash}`;
}

/** Static paths for every language, for use in getStaticPaths(). */
export const langPaths = () => langs.map((l) => ({ params: { lang: l === defaultLang ? undefined : l } }));
