# Infinity Analytics website

Marketing site for [infinity-analytics.com](https://infinity-analytics.com): a fast, static, animated site built with
[Astro](https://astro.build), Tailwind CSS, GSAP and Lenis.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serve the production build
```

Requires Node 20+. The output in `dist/` is plain static files and can be hosted anywhere
(Vercel, Netlify, Cloudflare Pages, Azure Static Web Apps, GitHub Pages).

## Where things live

| What | Where |
| --- | --- |
| All copy, English | `src/i18n/en.ts` |
| All copy, French | `src/i18n/fr.ts` |
| Contact details, client names, testimonials | `src/site.ts` |
| Showcase designs (drawn as SVG at build time) | `src/mocks.ts`, `src/components/Showcase.astro` |
| Colours, fonts, component styles | `src/styles/global.css` |
| Scroll animation, hero canvas, form logic | `src/scripts/` |
| Pages | `src/pages/[...lang]/` |

## Languages

English is served at `/`, French at `/fr/`. Every page is generated for every language from the same template.
To add a language, copy `src/i18n/en.ts`, translate it, and register it in `src/i18n/index.ts`. The `Copy` type
makes the build fail if a translation is missing a key.

## Contact form

Set `PUBLIC_FORM_ENDPOINT` (see `.env.example`) to any URL that accepts a JSON `POST`, such as Formspree,
Web3Forms or a Power Automate HTTP trigger. Without it, the form opens the visitor's email client addressed to
the contact address in `src/site.ts`.

## Logo

`src/components/Logo.astro` holds an SVG wordmark drawn for this redesign. Replace its contents with the official
logo file if you prefer to keep the existing one.
