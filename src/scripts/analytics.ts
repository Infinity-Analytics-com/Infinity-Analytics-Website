// Google Analytics 4, loaded only after the visitor accepts cookies.
// The measurement ID comes from PUBLIC_GA_ID at build time. With no ID, nothing loads
// and no banner is shown.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const root = document.documentElement;
const gaId = root.dataset.ga;
const KEY = 'cookie-consent';

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage unavailable */
  }
};

function loadGA() {
  if (!gaId || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaId);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.append(s);
}

/** Send an event to Google Analytics. Does nothing until analytics is loaded. */
export function track(name: string, params: Record<string, unknown> = {}) {
  window.gtag?.('event', name, params);
}

/** Campaign parameters from the landing URL, kept for the visit so leads can be attributed. */
export function campaign(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const saved = JSON.parse(sessionStorage.getItem('campaign') || '{}');
    Object.assign(out, saved);
    new URLSearchParams(location.search).forEach((v, k) => {
      if (/^(utm_|gclid$|fbclid$|msclkid$)/.test(k)) out[k] = v;
    });
    sessionStorage.setItem('campaign', JSON.stringify(out));
  } catch {
    /* storage unavailable */
  }
  return out;
}

export function initAnalytics() {
  campaign();
  const banner = document.querySelector<HTMLElement>('[data-consent]');
  if (gaId) {
    const choice = read(KEY);
    if (choice === 'granted') loadGA();
    else if (choice !== 'denied' && banner) {
      banner.hidden = false;
      banner.querySelectorAll<HTMLButtonElement>('[data-consent-choice]').forEach((b) =>
        b.addEventListener('click', () => {
          const v = b.dataset.consentChoice === 'granted' ? 'granted' : 'denied';
          write(KEY, v);
          banner.hidden = true;
          if (v === 'granted') loadGA();
        }),
      );
    }
  }
  // Conversions worth measuring besides page views.
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a');
    if (!a) return;
    const h = a.getAttribute('href') || '';
    if (h.startsWith('https://wa.me')) track('contact_whatsapp', { page: location.pathname });
    else if (h.startsWith('tel:')) track('contact_phone', { page: location.pathname });
    else if (h.startsWith('mailto:')) track('contact_email', { page: location.pathname });
  });
}
