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

/** Site base path without a trailing slash ('' at the domain root). */
export const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Build a localised URL: href('/contact/', 'fr') -> '/fr/contact/' (prefixed with the base path). */
export function href(path: string, lang: Lang): string {
  const clean = '/' + path.replace(/^\/+|\/+$/g, '');
  const withSlash = clean === '/' ? '/' : clean + '/';
  return base + (lang === defaultLang ? withSlash : `/${lang}${withSlash}`);
}

/** Static paths for every language, for use in getStaticPaths(). */
export const langPaths = () => langs.map((l) => ({ params: { lang: l === defaultLang ? undefined : l } }));

type Item = { slug: string; kind: string };
/** Unlocalised path of a service, solution, technology or training page. */
export function itemPath(item: Item): string {
  if (item.slug === 'training') return '/training';
  if (item.kind === 'training') return `/training/${item.slug.replace(/-training$/, '')}`;
  if (item.kind === 'technology') return `/technologies/${item.slug}`;
  return `/services/${item.slug}`;
}
export const itemHref = (item: Item, lang: Lang) => href(itemPath(item), lang);

/** Static paths ({ lang, slug }) for the items a route file is responsible for. */
export function itemPaths(match: (item: Item) => boolean, param: (item: Item) => string = (i) => i.slug) {
  return langs.flatMap((l) =>
    en.services.items.filter(match).map((i) => ({
      params: { lang: l === defaultLang ? undefined : l, slug: param(i) },
      props: { slug: i.slug },
    })),
  );
}

/** Menu order: what visitors are most likely to be looking for comes first. */
const interest = [
  'ai-readiness', 'ai-adoption', 'ai-consultancy', 'data-platforms', 'apps-development',
  'ai-agents', 'executive-cockpit', 'sales-forecasting', 'finance-analytics', 'fabric-jumpstart', 'power-bi-health-check',
];
const rank = (slug: string) => (interest.indexOf(slug) + 1 || interest.length + 1);
export const byInterest = <T extends { slug: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => rank(a.slug) - rank(b.slug));
