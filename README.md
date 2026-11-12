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

## Analytics and conversion tracking

Set `PUBLIC_GA_ID` to a Google Analytics 4 measurement ID. On GitHub Pages, add it as the repository variable
`GA_MEASUREMENT_ID` (and the form URL as `FORM_ENDPOINT`) under Settings > Secrets and variables > Actions > Variables.

- Analytics loads only after the visitor accepts the cookie banner. Without an ID there is no script and no banner.
- Events sent: `generate_lead` (form sent), `contact_whatsapp`, `contact_phone`, `contact_email`.
- After a successful form submission the visitor lands on `/thank-you/`, which is the page to register as a
  conversion in Google Ads.
- Campaign parameters (`utm_*`, `gclid`) are kept for the visit and sent with the form, so each lead shows which ad
  it came from.

## Logo

`src/components/Logo.astro` holds an SVG wordmark drawn for this redesign. Replace its contents with the official
logo file if you prefer to keep the existing one.
